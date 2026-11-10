import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Refund } from './refund.entity.js';
import { Order } from '../orders/order.entity.js';
import { User } from '../users/user.entity.js';
import { CreateRefundRequestDto, ApproveRefundDto, RejectRefundDto } from './dto/index.js';
import { VietQRClientService } from './vietqr-client.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class RefundsService {
    private readonly logger = new Logger(RefundsService.name);

    constructor(
        @InjectRepository(Refund)
        private refundsRepository: Repository<Refund>,
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private vietqrClientService: VietQRClientService,
        private notificationsService: NotificationsService,
    ) {}

    /**
     * Khách hàng gửi yêu cầu hoàn tiền
     */
    async createRefundRequest(currentUser: User, dto: CreateRefundRequestDto): Promise<Refund> {
        const order = await this.ordersRepository.findOne({
            where: { id: dto.orderId },
            relations: { user: true },
        });

        if (!order) {
            throw new NotFoundException(`Không tìm thấy đơn hàng #${dto.orderId}`);
        }

        // Chỉ chủ đơn hàng mới có thể gửi yêu cầu
        if (currentUser.role !== 'admin' && order.user?.id !== currentUser.id) {
            throw new ForbiddenException('Bạn không có quyền yêu cầu hoàn tiền cho đơn hàng này.');
        }

        // Đơn hàng phải đã thanh toán thì mới được hoàn tiền
        if (order.status !== 'paid' && order.status !== 'delivered' && order.status !== 'shipped') {
            throw new BadRequestException('Chỉ có thể yêu cầu hoàn tiền đối với các đơn hàng đã thanh toán hoặc đã giao.');
        }

        // Kiểm tra tổng số tiền đã hoàn trước đó
        const pastRefunds = await this.refundsRepository.find({
            where: { order: { id: order.id } },
        });

        const totalCompleted = pastRefunds
            .filter(r => r.status === 'completed' || r.status === 'approved')
            .reduce((sum, r) => sum + Number(r.amount), 0);

        const newTotalRefund = totalCompleted + Number(dto.amount);
        if (newTotalRefund > Number(order.total)) {
            throw new BadRequestException(
                `Tổng số tiền hoàn (${newTotalRefund.toLocaleString('vi-VN')} VND) vượt quá giá trị đơn hàng (${Number(order.total).toLocaleString('vi-VN')} VND). Đã hoàn trước đó: ${totalCompleted.toLocaleString('vi-VN')} VND.`,
            );
        }

        const refund = this.refundsRepository.create({
            order,
            user: currentUser,
            amount: dto.amount,
            reason: dto.reason,
            bankAccount: dto.bankAccount,
            bankName: dto.bankName,
            accountHolderName: dto.accountHolderName,
            status: 'pending',
        });

        const savedRefund = await this.refundsRepository.save(refund);

        // Gửi email và thông báo in-app
        if (currentUser.email) {
            this.notificationsService.sendRefundNotificationEmail(
                currentUser.email,
                order.id,
                dto.amount,
                'pending',
            ).catch(() => {});
        }
        this.notificationsService.createInAppNotification(
            currentUser.id,
            'Yêu cầu hoàn tiền đã gửi',
            `Yêu cầu hoàn tiền ${Number(dto.amount).toLocaleString('vi-VN')} VND cho đơn hàng #${order.id} đã được gửi thành công.`,
        ).catch(() => {});

        return savedRefund;
    }

    /**
     * Khách hàng xem danh sách yêu cầu hoàn tiền của mình
     */
    async findMyRefunds(currentUser: User): Promise<Refund[]> {
        return this.refundsRepository.find({
            where: { user: { id: currentUser.id } },
            relations: { order: true },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Xem chi tiết 1 yêu cầu hoàn tiền
     */
    async findRefundById(id: number, currentUser: User): Promise<Refund> {
        const refund = await this.refundsRepository.findOne({
            where: { id },
            relations: { order: true, user: true },
        });

        if (!refund) {
            throw new NotFoundException(`Không tìm thấy yêu cầu hoàn tiền #${id}`);
        }

        if (currentUser.role !== 'admin' && refund.user?.id !== currentUser.id) {
            throw new ForbiddenException('Bạn không có quyền truy cập yêu cầu hoàn tiền này.');
        }

        return refund;
    }

    /**
     * Admin xem tất cả các yêu cầu hoàn tiền
     */
    async findAllRefunds(status?: string): Promise<Refund[]> {
        let whereClause = {};
        if (status) {
            whereClause = { status };
        }
        return this.refundsRepository.find({
            where: whereClause,
            relations: { order: true, user: true },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Admin phê duyệt hoàn tiền và gọi API VietQR Pro
     */
    async approveRefund(refundId: number, dto: ApproveRefundDto): Promise<Refund> {
        const refund = await this.refundsRepository.findOne({
            where: { id: refundId },
            relations: { order: true, user: true },
        });

        if (!refund) {
            throw new NotFoundException(`Không tìm thấy yêu cầu hoàn tiền #${refundId}`);
        }

        if (refund.status === 'completed') {
            throw new BadRequestException('Yêu cầu hoàn tiền này đã được thực hiện thành công trước đó.');
        }

        if (refund.status === 'rejected') {
            throw new BadRequestException('Yêu cầu hoàn tiền này đã bị từ chối trước đó.');
        }

        // Cập nhật ghi chú của admin
        if (dto.adminNote) {
            refund.adminNote = dto.adminNote;
        }

        // Mã giao dịch thanh toán ban đầu (hoặc fallback nếu là mã đơn hàng)
        const referenceNumber = refund.order.paymentTransactionId || `DH${refund.order.id}`;

        this.logger.log(`Admin duyệt hoàn tiền #${refund.id}. Đang gọi API VietQR Pro...`);

        // Gọi sang VietQR Pro Refund API
        const refundResult = await this.vietqrClientService.refundTransaction({
            bankAccount: refund.bankAccount,
            referenceNumber,
            amount: String(refund.amount),
            content: `Hoan tien don hang DH${refund.order.id}`,
        });

        if (refundResult.status === 'SUCCESS') {
            refund.status = 'completed';
            refund.refundTransactionId = refundResult.message;
            refund.errorCode = null as any;

            // Cập nhật trạng thái đơn hàng
            refund.order.status = 'refunded';
            await this.ordersRepository.save(refund.order);

            // Gửi email thành công
            if (refund.user?.email) {
                this.notificationsService.sendRefundNotificationEmail(
                    refund.user.email,
                    refund.order.id,
                    refund.amount,
                    'completed',
                    { txnId: refundResult.message },
                ).catch(() => {});
            }
            if (refund.user?.id) {
                this.notificationsService.createInAppNotification(
                    refund.user.id,
                    'Hoàn tiền thành công',
                    `Đơn hàng #${refund.order.id} đã được hoàn tiền thành công số tiền ${Number(refund.amount).toLocaleString('vi-VN')} VND. Mã GD: ${refundResult.message}`,
                ).catch(() => {});
            }
        } else {
            refund.status = 'failed';
            refund.errorCode = refundResult.message;
            this.logger.error(`Hoàn tiền VietQR thất bại: Mã lỗi ${refundResult.message}`);
        }

        return this.refundsRepository.save(refund);
    }

    /**
     * Admin từ chối hoàn tiền
     */
    async rejectRefund(refundId: number, dto: RejectRefundDto): Promise<Refund> {
        const refund = await this.refundsRepository.findOne({
            where: { id: refundId },
            relations: { order: true, user: true },
        });

        if (!refund) {
            throw new NotFoundException(`Không tìm thấy yêu cầu hoàn tiền #${refundId}`);
        }

        if (refund.status === 'completed') {
            throw new BadRequestException('Không thể từ chối yêu cầu đã hoàn tiền thành công.');
        }

        refund.status = 'rejected';
        refund.adminNote = dto.reason;
        const savedRefund = await this.refundsRepository.save(refund);

        // Gửi email thông báo từ chối
        if (refund.user?.email) {
            this.notificationsService.sendRefundNotificationEmail(
                refund.user.email,
                refund.order.id,
                refund.amount,
                'rejected',
                { reason: dto.reason },
            ).catch(() => {});
        }
        if (refund.user?.id) {
            this.notificationsService.createInAppNotification(
                refund.user.id,
                'Yêu cầu hoàn tiền bị từ chối',
                `Yêu cầu hoàn tiền đơn hàng #${refund.order.id} không được chấp thuận. Lý do: ${dto.reason}`,
            ).catch(() => {});
        }

        return savedRefund;
    }
}

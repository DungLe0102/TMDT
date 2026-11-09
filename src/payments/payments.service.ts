import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity.js';
import { VietQRWebhookDto } from './vietqr-webhook.dto.js';
import type { User } from '../users/user.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private configService: ConfigService,
        private notificationsService: NotificationsService,
    ) { }

    /**
     * Sinh mã VietQR QuickLink cho đơn hàng
     */
    async generateVietQR(orderId: number, currentUser?: User): Promise<{
        orderId: number;
        total: number;
        bankId: string;
        accountNo: string;
        accountName: string;
        content: string;
        qrCodeUrl: string;
    }> {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: { user: true },
        });

        if (!order) {
            throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
        }

        // Kiểm tra quyền: chỉ chủ đơn hàng hoặc Admin mới được lấy QR thanh toán
        if (currentUser && currentUser.role !== 'admin' && order.user?.id !== currentUser.id) {
            throw new ForbiddenException('Bạn không có quyền xem thông tin thanh toán của đơn hàng này.');
        }

        if (order.status === 'paid') {
            throw new BadRequestException(`Đơn hàng #${orderId} đã được thanh toán thành công.`);
        }

        if (order.status === 'cancelled') {
            throw new BadRequestException(`Đơn hàng #${orderId} đã bị hủy.`);
        }

        const bankId = this.configService.get<string>('VIETQR_BANK_ID', 'HDBank');
        const accountNo = this.configService.get<string>('VIETQR_ACCOUNT_NO', '107704070005803');
        const accountName = this.configService.get<string>('VIETQR_ACCOUNT_NAME', 'LE XUAN DUNG');
        const content = `DH${order.id}`;

        // Định dạng VietQR QuickLink ảnh PNG chuẩn
        const encodedAccountName = encodeURIComponent(accountName);
        const encodedContent = encodeURIComponent(content);
        const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${order.total}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;

        order.paymentMethod = 'VIETQR';
        order.qrCodeUrl = qrCodeUrl;
        await this.ordersRepository.save(order);

        return {
            orderId: order.id,
            total: Number(order.total),
            bankId,
            accountNo,
            accountName,
            content,
            qrCodeUrl,
        };
    }

    /**
     * Xử lý Webhook biến động số dư từ VietQR / Ngân hàng
     */
    async handleWebhook(dto: VietQRWebhookDto, authHeader?: string): Promise<{
        success: boolean;
        message: string;
        orderId?: number;
    }> {
        const expectedSecret = this.configService.get<string>('VIETQR_WEBHOOK_SECRET');
        if (expectedSecret && authHeader) {
            const token = authHeader.replace(/^Bearer\s+/i, '').trim();
            if (token !== expectedSecret) {
                this.logger.warn(`Webhook bị từ chối: Secret không khớp.`);
                throw new BadRequestException('Mã xác thực Webhook không hợp lệ.');
            }
        }

        // Bóc tách mã đơn hàng từ nội dung chuyển khoản, vd: "DH15" hoặc "DH 15"
        const match = dto.description.match(/DH\s*(\d+)/i);
        if (!match) {
            this.logger.warn(`Không tìm thấy mã đơn hàng trong nội dung: "${dto.description}"`);
            return {
                success: false,
                message: 'Không tìm thấy mã đơn hàng hợp lệ trong nội dung chuyển khoản.',
            };
        }

        const orderId = parseInt(match[1], 10);
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: { user: true },
        });
        if (!order) {
            this.logger.warn(`Đơn hàng #${orderId} không tồn tại.`);
            return {
                success: false,
                message: `Đơn hàng #${orderId} không tồn tại.`,
            };
        }

        // Đảm bảo tính Idempotency: nếu đã thanh toán thì bỏ qua
        if (order.status === 'paid') {
            this.logger.log(`Đơn hàng #${orderId} đã được thanh toán trước đó.`);
            return {
                success: true,
                message: 'Đơn hàng đã được ghi nhận thanh toán trước đó.',
                orderId: order.id,
            };
        }

        // Kiểm tra số tiền chuyển có đủ không
        if (Number(dto.amount) < Number(order.total)) {
            this.logger.warn(
                `Số tiền không đủ cho đơn #${orderId}: Nhận ${dto.amount}, Cần ${order.total}`,
            );
            throw new BadRequestException(
                `Số tiền chuyển khoản (${dto.amount}) nhỏ hơn giá trị đơn hàng (${order.total}).`,
            );
        }

        // Cập nhật trạng thái đơn sang 'paid'
        order.status = 'paid';
        order.paymentTransactionId = dto.transactionId;
        order.paidAt = new Date();
        await this.ordersRepository.save(order);

        // Gửi thông báo thanh toán thành công qua Email và In-app
        if (order.user?.email) {
            this.notificationsService.sendOrderStatusUpdateEmail(
                order.user.email,
                order.id,
                'paid (Đã thanh toán)',
            ).catch(() => {});
        }
        if (order.user?.id) {
            this.notificationsService.createInAppNotification(
                order.user.id,
                'Thanh toán thành công',
                `Đơn hàng #${order.id} trị giá ${Number(order.total).toLocaleString('vi-VN')} VND đã được thanh toán thành công qua VietQR.`,
            ).catch(() => {});
        }

        this.logger.log(
            `Đơn hàng #${orderId} thanh toán thành công! Giao dịch: ${dto.transactionId}, Số tiền: ${dto.amount}`,
        );

        return {
            success: true,
            message: `Xác nhận thanh toán thành công cho đơn hàng #${orderId}`,
            orderId: order.id,
        };
    }
}

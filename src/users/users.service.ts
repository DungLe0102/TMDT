import { Injectable, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { CreateUserDto, UpdateUserDto, ForgotPasswordDto, ResetPasswordDto } from './dto/index.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @Inject(forwardRef(() => NotificationsService))
        private notificationsService: NotificationsService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { email, password, role } = createUserDto;

        const existing = await this.findOneByEmail(email);
        if (existing) {
            throw new ConflictException('Email này đã được sử dụng.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({ email, password: hashedPassword, role });
        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            select: {
                id: true,
                email: true,
                role: true,
                profile: true,
            },
        });
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findOneById(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
        const { password, profile } = updateUserDto;
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        await this.usersRepository.update(id, { ...(password && { password: hashedPassword }), ...(profile && { profile }) });
    }

    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.findOneByEmail(forgotPasswordDto.email);
        if (!user) {
            // Không lộ thông tin email có tồn tại hay không vì lý do bảo mật, nhưng vẫn trả về thông báo chung
            return { message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.' };
        }

        // Tạo token ngẫu nhiên bảo mật 6 chữ số hoặc 32 hex chars
        const resetToken = crypto.randomBytes(16).toString('hex');
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpires;
        await this.usersRepository.save(user);

        // Gửi email qua SMTP
        await this.notificationsService.sendPasswordResetEmail(user.email, resetToken);

        return { message: 'Mã khôi phục mật khẩu đã được gửi đến email của bạn.' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const { token, newPassword } = resetPasswordDto;
        const user = await this.usersRepository.findOne({
            where: { resetPasswordToken: token },
        });

        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new BadRequestException('Mã khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null as any;
        user.resetPasswordExpires = null as any;
        await this.usersRepository.save(user);

        return { message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.' };
    }
}

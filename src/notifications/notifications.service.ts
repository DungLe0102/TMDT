import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Notification } from './notification.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly usersService: UsersService,
  ) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<number>('SMTP_PORT')) || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendMail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    const from = this.configService.get<string>('SMTP_FROM') || '"E-Commerce Store" <no-reply@ecommerce.com>';
    const user = this.configService.get<string>('SMTP_USER');

    if (!user) {
      this.logger.warn(`[SMTP Not Configured] To: ${to} | Subject: ${subject}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text: text || subject,
        html,
      });
      this.logger.log(`[SMTP Sent] Email sent to ${to} (${subject})`);
      return true;
    } catch (error) {
      this.logger.error(`[SMTP Error] Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendOrderConfirmationEmail(email: string, orderId: number, total: number, itemsCount: number): Promise<void> {
    const subject = `Xác nhận đơn hàng #${orderId} thành công`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #2e7d32; text-align: center;">🎉 Cảm ơn bạn đã đặt hàng!</h2>
        <p>Xin chào,</p>
        <p>Đơn hàng <strong>#${orderId}</strong> của bạn đã được tiếp nhận thành công vào hệ thống.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> #${orderId}</p>
          <p style="margin: 5px 0;"><strong>Số lượng sản phẩm:</strong> ${itemsCount}</p>
          <p style="margin: 5px 0;"><strong>Tổng thanh toán:</strong> <span style="color: #d32f2f; font-weight: bold;">${Number(total).toLocaleString('vi-VN')} VND</span></p>
        </div>
        <p>Chúng tôi sẽ thông báo cho bạn ngay khi đơn hàng được chuyển sang đơn vị vận chuyển.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không trả lời thư này.</p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  async sendOrderStatusUpdateEmail(email: string, orderId: number, status: string): Promise<void> {
    const subject = `Cập nhật trạng thái đơn hàng #${orderId}: ${status.toUpperCase()}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1976d2; text-align: center;">📦 Cập nhật trạng thái đơn hàng</h2>
        <p>Xin chào,</p>
        <p>Đơn hàng <strong>#${orderId}</strong> của bạn hiện đã được cập nhật trạng thái mới:</p>
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: center;">
          <h3 style="color: #0d47a1; margin: 0; text-transform: uppercase;">${status}</h3>
        </div>
        <p>Cảm ơn bạn đã tin tưởng mua sắm cùng chúng tôi!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không trả lời thư này.</p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  // --- In-App Notifications ---

  async createInAppNotification(userId: number, title: string, message: string): Promise<Notification> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng #${userId}`);
    }

    const notification = this.notificationsRepository.create({
      user,
      title,
      message,
    });
    return this.notificationsRepository.save(notification);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(userId: number, notificationId: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo #${notificationId}`);
    }

    notification.read = true;
    return this.notificationsRepository.save(notification);
  }
}


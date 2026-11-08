import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity.js';
import type { User } from '../users/user.entity.js';
import PDFDocument from 'pdfkit';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async generateInvoice(orderId: number, currentUser?: User): Promise<string> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: {
        user: true,
        items: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    // Bảo mật: chỉ Admin hoặc chủ sở hữu đơn hàng mới được xem/tải hóa đơn
    if (currentUser && currentUser.role !== 'admin' && order.user?.id !== currentUser.id) {
      throw new ForbiddenException('Bạn không có quyền xem hóa đơn của đơn hàng này.');
    }

    const invoicesDir = path.resolve('invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const invoiceFileName = `invoice_${order.id}.pdf`;
    const invoiceFilePath = path.join(invoicesDir, invoiceFileName);

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(invoiceFilePath);

      doc.pipe(writeStream);

      // Tiêu đề hóa đơn
      doc.fontSize(20).text('HOA DON BAN HANG (INVOICE)', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Ma hoa don / Invoice ID: #INV-${order.id}`, { align: 'right' });
      const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
      doc.text(`Ngay tao / Date: ${dateStr}`, { align: 'right' });
      doc.text(`Trang thai / Status: ${order.status.toUpperCase()}`, { align: 'right' });
      doc.moveDown(1);

      // Thông tin khách hàng
      doc.fontSize(12).text('THONG TIN KHACH HANG (CUSTOMER INFO):', { underline: true });
      doc.fontSize(10).text(`Khach hang / Customer: ${order.user?.profile || 'Khach hang'}`);
      doc.text(`Email: ${order.user?.email || 'N/A'}`);
      doc.text(`Phuong thuc thanh toan: ${order.paymentMethod || 'VietQR / Banking'}`);
      if (order.paymentTransactionId) {
        doc.text(`Ma giao dich / Transaction ID: ${order.paymentTransactionId}`);
      }
      doc.moveDown(1.5);

      // Đường kẻ phân cách
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Bảng chi tiết mặt hàng
      const tableTop = doc.y;
      doc.fontSize(10).text('STT', 50, tableTop);
      doc.text('San pham (Product)', 90, tableTop);
      doc.text('So luong (Qty)', 290, tableTop);
      doc.text('Don gia (Price)', 380, tableTop);
      doc.text('Thanh tien (Amount)', 470, tableTop);

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      let currentY = doc.y;
      order.items?.forEach((item, index) => {
        const productName = item.product?.name || `Product #${item.product?.id || ''}`;
        const unitPrice = Number(item.price);
        const itemTotal = unitPrice * item.quantity;

        doc.text(`${index + 1}`, 50, currentY);
        doc.text(productName, 90, currentY, { width: 190 });
        doc.text(`${item.quantity}`, 290, currentY);
        doc.text(`${unitPrice.toLocaleString('vi-VN')} d`, 380, currentY);
        doc.text(`${itemTotal.toLocaleString('vi-VN')} d`, 470, currentY);

        currentY += 25;
      });

      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 10;

      // Tổng tiền
      doc.fontSize(12).text(
        `TONG CONG (TOTAL): ${Number(order.total).toLocaleString('vi-VN')} VND`,
        50,
        currentY,
        { align: 'right' },
      );

      doc.moveDown(2);
      doc.fontSize(10).text('Cam on quy khach da mua sam tai he thong!', { align: 'center' });

      doc.end();

      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });

    return invoiceFilePath;
  }
}


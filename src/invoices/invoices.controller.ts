import { Controller, Get, Param, Res, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import type { Response, Request } from 'express';
import type { User } from '../users/user.entity.js';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Đăng nhập] Xuất hóa đơn bán hàng PDF theo mã đơn hàng' })
  @ApiParam({ name: 'orderId', description: 'ID đơn hàng cần xuất hóa đơn' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'File hóa đơn PDF' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập hóa đơn của đơn hàng này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async getInvoice(
    @Req() req: RequestWithUser,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Res() res: Response,
  ) {
    const invoicePath = await this.invoicesService.generateInvoice(orderId, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice_${orderId}.pdf"`);
    res.sendFile(invoicePath);
  }
}


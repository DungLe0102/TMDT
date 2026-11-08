import { Controller, Post, Param, ParseIntPipe, Body, Headers, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { VietQRWebhookDto } from './vietqr-webhook.dto.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import type { Request } from 'express';
import type { User } from '../users/user.entity.js';

interface RequestWithUser extends Request {
    user: User;
}

@ApiTags('Payments & Webhooks (VietQR)')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('vietqr/:orderId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Đăng nhập] Lấy thông tin và link ảnh mã VietQR thanh toán cho đơn hàng' })
    @ApiParam({ name: 'orderId', description: 'ID đơn hàng cần thanh toán' })
    @ApiResponse({ status: 200, description: 'Tạo mã VietQR thành công' })
    @ApiResponse({ status: 400, description: 'Đơn hàng đã thanh toán hoặc đã bị hủy' })
    @ApiResponse({ status: 403, description: 'Không có quyền truy cập đơn hàng này' })
    generateVietQR(
        @Req() req: RequestWithUser,
        @Param('orderId', ParseIntPipe) orderId: number,
    ) {
        return this.paymentsService.generateVietQR(orderId, req.user);
    }

    @Post('webhook/vietqr')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Webhook nhận thông báo biến động số dư / thanh toán thành công từ VietQR hoặc Ngân hàng',
        description: 'Tự động đối soát đơn hàng qua mã "DH<id>" trong nội dung chuyển khoản và chuyển trạng thái đơn sang "paid".',
    })
    @ApiHeader({
        name: 'Authorization',
        required: false,
        description: 'Bearer secret_key đối soát (nếu cấu hình VIETQR_WEBHOOK_SECRET)',
    })
    @ApiResponse({ status: 200, description: 'Đã nhận và xử lý Webhook thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu webhook hoặc số tiền không hợp lệ' })
    handleWebhook(
        @Body() webhookDto: VietQRWebhookDto,
        @Headers('authorization') authHeader?: string,
    ) {
        return this.paymentsService.handleWebhook(webhookDto, authHeader);
    }
}

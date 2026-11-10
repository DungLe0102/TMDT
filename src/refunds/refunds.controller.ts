import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Req,
    UseGuards,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RefundsService } from './refunds.service.js';
import { CreateRefundRequestDto, ApproveRefundDto, RejectRefundDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import type { Request } from 'express';
import type { User } from '../users/user.entity.js';

interface RequestWithUser extends Request {
    user: User;
}

@ApiTags('Refunds (Hoàn tiền VietQR Pro)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('refunds')
export class RefundsController {
    constructor(private readonly refundsService: RefundsService) {}

    @Post('request')
    @ApiOperation({ summary: '[Khách hàng] Gửi đơn yêu cầu hoàn tiền cho đơn hàng đã thanh toán' })
    @ApiResponse({ status: 201, description: 'Yêu cầu hoàn tiền đã được tạo và chờ duyệt' })
    createRefundRequest(
        @Req() req: RequestWithUser,
        @Body() dto: CreateRefundRequestDto,
    ) {
        return this.refundsService.createRefundRequest(req.user, dto);
    }

    @Get('my-requests')
    @ApiOperation({ summary: '[Khách hàng] Xem danh sách các yêu cầu hoàn tiền của bản thân' })
    getMyRefunds(@Req() req: RequestWithUser) {
        return this.refundsService.findMyRefunds(req.user);
    }

    @Get(':id')
    @ApiOperation({ summary: '[Đăng nhập] Xem chi tiết 1 yêu cầu hoàn tiền theo ID' })
    @ApiParam({ name: 'id', description: 'ID yêu cầu hoàn tiền' })
    getRefundById(
        @Req() req: RequestWithUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.refundsService.findRefundById(id, req.user);
    }

    // --- Admin Endpoints ---

    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin] Lấy danh sách toàn bộ yêu cầu hoàn tiền trong hệ thống' })
    @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'completed', 'rejected', 'failed'] })
    getAllRefunds(@Query('status') status?: string) {
        return this.refundsService.findAllRefunds(status);
    }

    @Post(':id/approve')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin] Phê duyệt hoàn tiền và kích hoạt gọi API VietQR Pro' })
    @ApiParam({ name: 'id', description: 'ID yêu cầu hoàn tiền cần duyệt' })
    approveRefund(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ApproveRefundDto,
    ) {
        return this.refundsService.approveRefund(id, dto);
    }

    @Post(':id/reject')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin] Từ chối yêu cầu hoàn tiền kèm lý do' })
    @ApiParam({ name: 'id', description: 'ID yêu cầu hoàn tiền cần từ chối' })
    rejectRefund(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RejectRefundDto,
    ) {
        return this.refundsService.rejectRefund(id, dto);
    }
}

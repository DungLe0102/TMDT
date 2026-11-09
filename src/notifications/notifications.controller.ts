import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Req,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import type { Request } from 'express';
import type { User } from '../users/user.entity.js';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thông báo in-app mới cho người dùng hiện tại' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Khuyến mãi đặc biệt' },
        message: { type: 'string', example: 'Giảm giá 20% cho đơn hàng tiếp theo!' },
      },
      required: ['message'],
    },
  })
  @ApiResponse({ status: 201, description: 'Tạo thông báo thành công' })
  createNotification(
    @Req() req: RequestWithUser,
    @Body('title') title: string,
    @Body('message') message: string,
  ) {
    const userId = req.user.id;
    return this.notificationsService.createInAppNotification(userId, title || 'Thông báo', message);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ thông báo của người dùng hiện tại' })
  getNotifications(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':notificationId/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo là đã đọc' })
  @ApiParam({ name: 'notificationId', description: 'ID của thông báo' })
  markAsRead(
    @Req() req: RequestWithUser,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(userId, notificationId);
  }
}

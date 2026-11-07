import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import type { Request } from 'express';
import type { User } from '../users/user.entity.js';

interface RequestWithUser extends Request {
    user: User;
}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Customer & Admin] Tạo đơn đặt hàng mới' })
    @ApiResponse({ status: 201, description: 'Đơn hàng được tạo thành công' })
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.createOrder(createOrderDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả đơn hàng hệ thống' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền xem toàn bộ đơn' })
    findAllOrders() {
        return this.ordersService.findAllOrders();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Đăng nhập] Xem chi tiết đơn hàng theo ID' })
    @ApiParam({ name: 'id', description: 'ID đơn hàng' })
    findOrderById(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.findOrderById(id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Cập nhật trạng thái đơn hàng (shipped, delivered...)' })
    @ApiParam({ name: 'id', description: 'ID đơn hàng' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền đổi trạng thái' })
    updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
        return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Xóa đơn hàng' })
    @ApiParam({ name: 'id', description: 'ID đơn hàng' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền' })
    removeOrder(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.removeOrder(id);
    }
}

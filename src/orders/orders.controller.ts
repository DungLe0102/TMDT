import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/index.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo đơn đặt hàng mới' })
    @ApiResponse({ status: 201, description: 'Đơn hàng được tạo thành công' })
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.createOrder(createOrderDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả đơn hàng' })
    findAllOrders() {
        return this.ordersService.findAllOrders();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Xem chi tiết đơn hàng theo ID' })
    @ApiParam({ name: 'id', description: 'ID đơn hàng' })
    findOrderById(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.findOrderById(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
    @ApiParam({ name: 'id', description: 'ID đơn hàng' })
    updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
        return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa đơn hàng' })
    @ApiParam({ name: 'id', description: 'ID đơn hàng' })
    removeOrder(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.removeOrder(id);
    }
}

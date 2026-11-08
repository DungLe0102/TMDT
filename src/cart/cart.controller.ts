import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service.js';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import type { Request } from 'express';
import type { User } from '../users/user.entity.js';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Shopping Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @ApiResponse({ status: 201, description: 'Thêm vào giỏ thành công' })
  addItem(@Req() req: RequestWithUser, @Body() createCartItemDto: CreateCartItemDto) {
    const userId = req.user.id;
    return this.cartService.addItem(userId, createCartItemDto);
  }

  @Patch('update/:itemId')
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng' })
  @ApiParam({ name: 'itemId', description: 'ID của mục giỏ hàng (CartItem ID)' })
  updateItem(
    @Req() req: RequestWithUser,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = req.user.id;
    return this.cartService.updateItem(userId, itemId, updateCartItemDto);
  }

  @Delete('remove/:itemId')
  @ApiOperation({ summary: 'Xóa một sản phẩm khỏi giỏ hàng' })
  @ApiParam({ name: 'itemId', description: 'ID của mục giỏ hàng (CartItem ID)' })
  removeItem(@Req() req: RequestWithUser, @Param('itemId', ParseIntPipe) itemId: number) {
    const userId = req.user.id;
    return this.cartService.removeItem(userId, itemId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Xem giỏ hàng và tổng tiền hiện tại' })
  getCartSummary(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.cartService.getCartSummary(userId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Thanh toán / Đặt hàng toàn bộ sản phẩm trong giỏ hàng' })
  @ApiResponse({ status: 201, description: 'Đặt hàng thành công và giỏ hàng được làm rỗng' })
  checkout(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.cartService.checkout(userId);
  }
}


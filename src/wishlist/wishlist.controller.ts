import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import type { Request } from 'express';
import type { User } from '../users/user.entity.js';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':productId')
  @ApiOperation({ summary: 'Thêm sản phẩm vào danh sách yêu thích' })
  @ApiParam({ name: 'productId', description: 'ID của sản phẩm' })
  @ApiResponse({ status: 201, description: 'Đã thêm vào danh sách yêu thích' })
  addToWishlist(
    @Req() req: RequestWithUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user.id;
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi danh sách yêu thích' })
  @ApiParam({ name: 'productId', description: 'ID của sản phẩm' })
  removeFromWishlist(
    @Req() req: RequestWithUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user.id;
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  @Get()
  @ApiOperation({ summary: 'Xem toàn bộ danh sách sản phẩm yêu thích của người dùng' })
  viewWishlist(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.wishlistService.viewWishlist(userId);
  }
}


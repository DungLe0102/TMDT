import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto, UpdateReviewDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import type { Request } from 'express';
import type { User } from '../users/user.entity.js';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Reviews & Rating')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng đánh giá cho sản phẩm' })
  @ApiParam({ name: 'productId', description: 'ID của sản phẩm cần đánh giá' })
  @ApiResponse({ status: 201, description: 'Đánh giá thành công' })
  addReview(
    @Req() req: RequestWithUser,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const userId = req.user.id;
    return this.reviewsService.addReview(userId, productId, createReviewDto);
  }

  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật đánh giá của chính mình' })
  @ApiParam({ name: 'reviewId', description: 'ID của đánh giá' })
  updateReview(
    @Req() req: RequestWithUser,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const userId = req.user.id;
    return this.reviewsService.updateReview(userId, reviewId, updateReviewDto);
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa đánh giá (chủ sở hữu hoặc admin)' })
  @ApiParam({ name: 'reviewId', description: 'ID của đánh giá' })
  deleteReview(
    @Req() req: RequestWithUser,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.reviewsService.deleteReview(userId, reviewId, userRole);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Lấy toàn bộ đánh giá và điểm trung bình của sản phẩm' })
  @ApiParam({ name: 'productId', description: 'ID của sản phẩm' })
  getProductReviews(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getProductReviews(productId);
  }
}


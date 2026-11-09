import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity.js';
import { CreateReviewDto, UpdateReviewDto } from './dto/index.js';
import { UsersService } from '../users/users.service.js';
import { ProductsService } from '../products/products.service.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async addReview(userId: number, productId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng #${userId}`);
    }

    const product = await this.productsService.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm #${productId}`);
    }

    const review = this.reviewsRepository.create({
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      user,
      product,
    });

    return this.reviewsRepository.save(review);
  }

  async updateReview(userId: number, reviewId: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
      relations: { user: true },
    });

    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá #${reviewId}`);
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa đánh giá này');
    }

    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }
    if (updateReviewDto.comment !== undefined) {
      review.comment = updateReviewDto.comment;
    }

    return this.reviewsRepository.save(review);
  }

  async deleteReview(userId: number, reviewId: number, userRole: string): Promise<void> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
      relations: { user: true },
    });

    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá #${reviewId}`);
    }

    if (review.user.id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
    }

    await this.reviewsRepository.remove(review);
  }

  async getProductReviews(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    reviews: Review[];
  }> {
    await this.productsService.findProductById(productId);

    const reviews = await this.reviewsRepository.find({
      where: { product: { id: productId } },
      relations: {
        user: true,
      },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          id: true,
          email: true,
          profile: true,
        },
      },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    return {
      averageRating,
      totalReviews,
      reviews,
    };
  }
}

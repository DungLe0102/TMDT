import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity.js';
import { UsersService } from '../users/users.service.js';
import { ProductsService } from '../products/products.service.js';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async addToWishlist(userId: number, productId: number): Promise<Wishlist> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng #${userId}`);
    }

    const product = await this.productsService.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm #${productId}`);
    }

    const existing = await this.wishlistRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existing) {
      throw new ConflictException('Sản phẩm này đã có trong danh sách yêu thích');
    }

    const wishlistItem = this.wishlistRepository.create({ user, product });
    return this.wishlistRepository.save(wishlistItem);
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const wishlistItem = await this.wishlistRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (!wishlistItem) {
      throw new NotFoundException('Sản phẩm không có trong danh sách yêu thích');
    }

    await this.wishlistRepository.remove(wishlistItem);
  }

  async viewWishlist(userId: number): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { user: { id: userId } },
      relations: {
        product: {
          category: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}


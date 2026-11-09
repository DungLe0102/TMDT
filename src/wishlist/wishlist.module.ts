import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './wishlist.entity.js';
import { WishlistService } from './wishlist.service.js';
import { WishlistController } from './wishlist.controller.js';
import { UsersModule } from '../users/users.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist]),
    UsersModule,
    ProductsModule,
  ],
  providers: [WishlistService],
  controllers: [WishlistController],
  exports: [WishlistService],
})
export class WishlistModule {}


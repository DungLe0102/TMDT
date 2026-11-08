import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem } from './cart.entity.js';
import { CartService } from './cart.service.js';
import { CartController } from './cart.controller.js';
import { UsersModule } from '../users/users.module.js';
import { ProductsModule } from '../products/products.module.js';
import { OrdersModule } from '../orders/orders.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}


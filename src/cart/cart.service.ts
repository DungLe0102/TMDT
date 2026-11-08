import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from './cart.entity.js';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/index.js';
import { UsersService } from '../users/users.service.js';
import { ProductsService } from '../products/products.service.js';
import { OrdersService } from '../orders/orders.service.js';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) {}

  async findOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!cart) {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng #${userId}`);
      }
      cart = this.cartRepository.create({ user, items: [] });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItem(userId: number, createCartItemDto: CreateCartItemDto): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    const { productId, quantity } = createCartItemDto;
    const product = await this.productsService.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm #${productId}`);
    }

    if (product.quantity < quantity) {
      throw new BadRequestException(
        `Sản phẩm "${product.name}" trong kho chỉ còn ${product.quantity} sản phẩm.`,
      );
    }

    let cartItem = cart.items.find(item => item.product?.id === productId);
    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.quantity < newQuantity) {
        throw new BadRequestException(
          `Tổng số lượng trong giỏ (${newQuantity}) vượt quá số lượng tồn kho (${product.quantity}).`,
        );
      }
      cartItem.quantity = newQuantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({ cart, product, quantity });
      await this.cartItemRepository.save(cartItem);
    }

    return this.findOrCreateCart(userId);
  }

  async updateItem(userId: number, cartItemId: number, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    const cartItem = cart.items.find(item => item.id === cartItemId);
    if (!cartItem) {
      throw new NotFoundException(`Không tìm thấy mục hàng #${cartItemId} trong giỏ.`);
    }

    const product = await this.productsService.findProductById(cartItem.product.id);
    if (product.quantity < updateCartItemDto.quantity) {
      throw new BadRequestException(
        `Sản phẩm "${product.name}" trong kho chỉ còn ${product.quantity} sản phẩm.`,
      );
    }

    cartItem.quantity = updateCartItemDto.quantity;
    await this.cartItemRepository.save(cartItem);
    return this.findOrCreateCart(userId);
  }

  async removeItem(userId: number, cartItemId: number): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    const cartItem = cart.items.find(item => item.id === cartItemId);
    if (!cartItem) {
      throw new NotFoundException(`Không tìm thấy mục hàng #${cartItemId} trong giỏ.`);
    }

    await this.cartItemRepository.remove(cartItem);
    return this.findOrCreateCart(userId);
  }

  async getCartSummary(userId: number): Promise<{
    cart: Cart;
    totalAmount: number;
    totalItems: number;
  }> {
    const cart = await this.findOrCreateCart(userId);
    let totalAmount = 0;
    let totalItems = 0;

    for (const item of cart.items) {
      totalItems += item.quantity;
      if (item.product) {
        totalAmount += Number(item.product.price) * item.quantity;
      }
    }

    return {
      cart,
      totalAmount,
      totalItems,
    };
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.findOrCreateCart(userId);
    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
      cart.items = [];
    }
  }

  async checkout(userId: number) {
    const cart = await this.findOrCreateCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng đang trống, không thể thanh toán.');
    }

    // Tạo đơn hàng từ các món trong giỏ hàng
    const orderItems = cart.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const order = await this.ordersService.createOrder({
      userId,
      items: orderItems,
    });

    // Làm rỗng giỏ hàng sau khi đặt đơn thành công
    await this.clearCart(userId);

    return {
      message: 'Đặt hàng từ giỏ hàng thành công!',
      orderId: order.id,
      total: order.total,
      status: order.status,
    };
  }
}


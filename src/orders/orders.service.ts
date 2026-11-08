import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from './order.entity.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/index.js';
import { UsersService } from '../users/users.service.js';
import { ProductsService } from '../products/products.service.js';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        private usersService: UsersService,
        private productsService: ProductsService,
    ) { }

    async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
        const { userId, items } = createOrderDto;

        if (!userId) {
            throw new BadRequestException('User ID không hợp lệ hoặc không tìm thấy thông tin đăng nhập.');
        }

        const user = await this.usersService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(`Không tìm thấy người dùng với ID ${userId}`);
        }

        const orderItems: OrderItem[] = [];
        let total = 0;

        for (const item of items) {
            const product = await this.productsService.findProductById(item.productId);
            if (!product) {
                throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${item.productId}`);
            }

            if (product.quantity < item.quantity) {
                throw new BadRequestException(
                    `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho (bạn đặt ${item.quantity}).`,
                );
            }

            // Trừ số lượng tồn kho
            product.quantity -= item.quantity;
            await this.productsService.updateProduct(product.id, { quantity: product.quantity });

            const orderItem = this.orderItemsRepository.create({
                product,
                quantity: item.quantity,
                price: Number(product.price) * item.quantity,
            });
            orderItems.push(orderItem);
            total += orderItem.price;
        }

        const order = this.ordersRepository.create({
            user,
            status: 'placed',
            total,
            items: orderItems,
        });

        return this.ordersRepository.save(order);
    }

    async findAllOrders(): Promise<Order[]> {
        return this.ordersRepository.find({
            relations: {
                user: true,
                items: {
                    product: true,
                },
            },
        });
    }

    async findOrderById(id: number): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: {
                user: true,
                items: {
                    product: true,
                },
            },
        });
        if (!order) {
            throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${id}`);
        }
        return order;
    }

    async updateOrderStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
        const order = await this.findOrderById(id);
        order.status = updateOrderStatusDto.status;
        return this.ordersRepository.save(order);
    }

    async removeOrder(id: number): Promise<void> {
        const order = await this.findOrderById(id);
        await this.ordersRepository.remove(order);
    }
}

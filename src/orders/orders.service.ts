import { Injectable, NotFoundException } from '@nestjs/common';
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

        const user = await this.usersService.findOneById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const orderItems: OrderItem[] = [];
        let total = 0;

        for (const item of items) {
            const product = await this.productsService.findProductById(item.productId);
            if (!product) {
                throw new NotFoundException(`Product with ID ${item.productId} not found`);
            }
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
            throw new NotFoundException('Order not found');
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

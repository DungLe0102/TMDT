import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Product } from '../products/product.entity.js';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user: User) => user.orders)
    user: User;

    @Column({ default: 'placed' })
    status: string; // 'placed', 'shipped', 'delivered', 'cancelled', 'returned'

    @Column('decimal')
    total: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => OrderItem, (orderItem: OrderItem) => orderItem.order, { cascade: true })
    items: OrderItem[];
}

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, (order: Order) => order.items)
    order: Order;

    @ManyToOne(() => Product, (product: Product) => product.id)
    product: Product;

    @Column('int')
    quantity: number;

    @Column('decimal')
    price: number;
}

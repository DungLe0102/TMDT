import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Product } from '../products/product.entity.js';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @ManyToOne(() => User, (user: User) => user.orders)
    user: User;

    @Index()
    @Column({ default: 'placed' })
    status: string; // 'placed', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'

    @Column('decimal')
    total: number;

    @Column({ nullable: true })
    paymentMethod: string; // 'VIETQR', 'COD', etc.

    @Column({ nullable: true })
    qrCodeUrl: string;

    @Index()
    @Column({ nullable: true })
    paymentTransactionId: string;

    @Index()
    @Column({ type: 'timestamp', nullable: true })
    paidAt: Date;

    @Index()
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

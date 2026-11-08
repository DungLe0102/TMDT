import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import type { Order } from '../orders/order.entity.js';
import type { Cart } from '../cart/cart.entity.js';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    role: string; // 'admin' or 'customer'

    @Column({ default: '' })
    profile: string;

    @OneToMany('Order', (order: Order) => order.user)
    orders: Order[];

    @OneToMany('Cart', (cart: Cart) => cart.user)
    carts: Cart[];
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Index } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Product } from '../products/product.entity.js';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User, (user: User) => user.carts)
  user: User;

  @OneToMany(() => CartItem, (cartItem: CartItem) => cartItem.cart, { cascade: true })
  items: CartItem[];
}

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Cart, (cart: Cart) => cart.items)
  cart: Cart;

  @Index()
  @ManyToOne(() => Product, (product: Product) => product.id)
  product: Product;

  @Column('int')
  quantity: number;
}


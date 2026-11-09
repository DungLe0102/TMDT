import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index, Unique } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Product } from '../products/product.entity.js';

@Entity()
@Unique(['user', 'product'])
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User, (user: User) => user.wishlists, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @ManyToOne(() => Product, (product: Product) => product.wishlists, { onDelete: 'CASCADE' })
  product: Product;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}


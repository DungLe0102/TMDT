import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Product } from '../products/product.entity.js';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @ManyToOne(() => User, (user: User) => user.reviews, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @ManyToOne(() => Product, (product: Product) => product.reviews, { onDelete: 'CASCADE' })
  product: Product;
}


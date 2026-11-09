import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Category } from './category.entity.js';
import type { Review } from '../reviews/review.entity.js';
import type { Wishlist } from '../wishlist/wishlist.entity.js';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column('decimal')
    price: number;

    @Column()
    sku: string;

    @Column()
    quantity: number;

    @ManyToOne(() => Category, (category: Category) => category.products)
    category: Category;

    @OneToMany('Review', (review: Review) => review.product)
    reviews: Review[];

    @OneToMany('Wishlist', (wishlist: Wishlist) => wishlist.product)
    wishlists: Wishlist[];
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Order } from '../orders/order.entity.js';

@Entity()
export class Refund {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @ManyToOne(() => Order, { onDelete: 'CASCADE' })
    order: Order;

    @Index()
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column('decimal')
    amount: number;

    @Column('text')
    reason: string;

    @Column()
    bankAccount: string;

    @Column()
    bankName: string;

    @Column()
    accountHolderName: string;

    @Index()
    @Column({ default: 'pending' })
    status: string; // 'pending', 'approved', 'completed', 'rejected', 'failed'

    @Column({ nullable: true })
    refundTransactionId: string;

    @Column({ nullable: true })
    errorCode: string;

    @Column('text', { nullable: true })
    adminNote: string;

    @Index()
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity.js';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Thông báo' })
  title: string;

  @Column('text')
  message: string;

  @Index()
  @Column({ default: false })
  read: boolean;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @ManyToOne(() => User, (user: User) => user.notifications, { onDelete: 'CASCADE' })
  user: User;
}


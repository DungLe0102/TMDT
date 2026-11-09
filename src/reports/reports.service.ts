import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity.js';
import { User } from '../users/user.entity.js';
import { Product } from '../products/product.entity.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async getSalesReport(startDate?: string, endDate?: string) {
    let qb = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product');

    if (startDate && endDate) {
      qb = qb.where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      qb = qb.where('order.createdAt >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      qb = qb.where('order.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    const orders = await qb.orderBy('order.createdAt', 'DESC').getMany();

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const paidOrders = orders.filter(order => order.status === 'paid' || order.paidAt !== null);
    const totalPaidSales = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      summary: {
        totalOrders,
        totalSales,
        paidOrdersCount: paidOrders.length,
        totalPaidSales,
      },
      orders,
    };
  }

  async getAnalytics() {
    const totalUsers = await this.usersRepository.count();
    const totalProducts = await this.productsRepository.count();
    const totalOrders = await this.ordersRepository.count();

    const orders = await this.ordersRepository.find({
      select: {
        id: true,
        status: true,
        total: true,
        paidAt: true,
      },
    });

    const totalRevenue = orders
      .filter(o => o.status === 'paid' || o.paidAt !== null)
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      ordersByStatus,
    };
  }
}

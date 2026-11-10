import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from './refund.entity.js';
import { Order } from '../orders/order.entity.js';
import { RefundsService } from './refunds.service.js';
import { RefundsController } from './refunds.controller.js';
import { VietQRClientService } from './vietqr-client.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Refund, Order]),
        NotificationsModule,
    ],
    providers: [RefundsService, VietQRClientService],
    controllers: [RefundsController],
    exports: [RefundsService, VietQRClientService],
})
export class RefundsModule {}

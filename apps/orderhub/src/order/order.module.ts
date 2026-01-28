import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TableSessionModule } from 'src/table-session/tableSession.module';
import { OrderItemModule } from 'src/order-item/orderItem.module';

@Module({
  imports: [TableSessionModule, OrderItemModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

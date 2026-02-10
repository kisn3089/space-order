import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { OrderItemController } from './order-item/orderItem.controller';
import { OrderItemService } from './order-item/orderItem.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { CustomerOrderController } from './order/customer-order.controller';

@Module({
  imports: [PassportModule, JwtModule],
  controllers: [OrderItemController, OrderController, CustomerOrderController],
  providers: [OrderItemService, OrderService],
})
export class OrderModule {}

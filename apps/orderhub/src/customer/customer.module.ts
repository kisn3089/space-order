import { Module } from '@nestjs/common';
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

@Module({
  controllers: [SessionController, OrderController],
  providers: [SessionService, OrderService],
})
export class CustomerModule {}

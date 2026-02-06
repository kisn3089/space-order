import { Module } from '@nestjs/common';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

@Module({
  controllers: [SessionController, OrderController],
  providers: [SessionService, OrderService, QueryParamsBuilderService],
})
export class CustomerModule {}

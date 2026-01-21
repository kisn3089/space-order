import { Module } from '@nestjs/common';
import { OrderItemService } from './orderItem.service';
import { OrderItemController } from './orderItem.controller';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';

@Module({
  controllers: [OrderItemController],
  providers: [OrderItemService, QueryParamsBuilderService],
})
export class OrderItemModule {}

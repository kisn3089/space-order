import { Module } from '@nestjs/common';
import { OrderItemService } from './orderItem.service';
import { OrderItemController } from './orderItem.controller';
import { BuildIncludeService } from 'src/utils/query-params/build-include';

@Module({
  controllers: [OrderItemController],
  providers: [OrderItemService, BuildIncludeService],
})
export class OrderItemModule {}

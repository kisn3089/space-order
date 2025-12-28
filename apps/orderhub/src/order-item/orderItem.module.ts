import { Module } from '@nestjs/common';
import { OrderItemService } from './orderItem.service';
import { OrderItemController } from './orderItem.controller';

@Module({
  controllers: [OrderItemController],
  providers: [OrderItemService],
})
export class OrderItemModule {}

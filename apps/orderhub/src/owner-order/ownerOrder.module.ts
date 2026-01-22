import { Module } from '@nestjs/common';
import { OwnerOrderController } from './ownerOrder.controller';
import { TableModule } from 'src/table/table.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [TableModule, OrderModule],
  controllers: [OwnerOrderController],
})
export class OwnerOrderModule {}

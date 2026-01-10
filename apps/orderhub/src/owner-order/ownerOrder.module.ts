import { Module } from '@nestjs/common';
import { TableSessionModule } from 'src/table-session/tableSession.module';
import { OwnerOrderController } from './ownerOrder.controller';
import { TableModule } from 'src/table/table.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [TableSessionModule, TableModule, OrderModule],
  controllers: [OwnerOrderController],
})
export class OwnerOrderModule {}

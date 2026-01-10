import { Module } from '@nestjs/common';
import { OwnerOrderService } from './ownerOrder.service';

@Module({
  providers: [OwnerOrderService],
})
export class OwnerOrderModule {}

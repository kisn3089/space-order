import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Client } from 'src/decorators/client.decorator';
import type { Owner } from '@spaceorder/db';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async getList(@Client() client: Owner) {
    return await this.storeService.getStoreList({
      where: { ownerId: client.id },
      omit: this.storeService.storeOmit,
    });
  }

  /** 추후 지점이 2개 이상인 경우 로컬 스토리지를 통해 활성화된 storeId 값으로 변경한다. */
  @Get('order-summary')
  async getOrderSummary(@Client() client: Owner) {
    return await this.storeService.getOrderSummary(client);
  }

  @Get(':storeId')
  async getUnique(@Param('storeId') storeId: string) {
    return await this.storeService.getStoreUnique({
      where: { publicId: storeId },
    });
  }
}

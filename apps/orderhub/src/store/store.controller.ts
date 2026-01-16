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
  async getStoreList(@Client() client: Owner) {
    return await this.storeService.getStoreList(client);
  }

  /** 추후 지점이 2개 이상인 경우 로컬 스토리지를 통해 활성하된 storeId 값으로 변경한다. */
  @Get('alive-orders')
  async getStoreWithOrderList(@Client() client: Owner) {
    return await this.storeService.getStoreWithOrderList(client);
  }

  @Get(':storeId')
  async getStoreById(@Param('storeId') storeId: string) {
    return await this.storeService.getStoreById(storeId);
  }
}

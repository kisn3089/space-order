import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  Param,
  // Delete,
  UseGuards,
} from '@nestjs/common';
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

  @Get(':storeId')
  async getStoreById(@Param('storeId') storeId: string) {
    return await this.storeService.getStoreById(storeId);
  }
}

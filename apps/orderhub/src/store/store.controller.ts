import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }

  @Get()
  async findAll() {
    return await this.storeService.findAll();
  }

  @Get(':storeId')
  async findOne(@Param('storeId') storeId: string) {
    return await this.storeService.findOne(storeId);
  }

  @Patch(':storeId')
  update(
    @Param('storeId') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storeService.update(+storeId, updateStoreDto);
  }

  @Delete(':storeId')
  remove(@Param('storeId') storeId: string) {
    return this.storeService.remove(+storeId);
  }
}

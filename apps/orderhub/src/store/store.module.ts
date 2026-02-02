import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [RouterModule.register([{ path: 'store/v1', module: StoreModule }])],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}

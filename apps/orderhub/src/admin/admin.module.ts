import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { OwnerController } from './owner/owner.controller';
import { OwnerService } from './owner/owner.service';
import { StoreController } from './store/store.controller';
import { StoreService } from './store/store.service';

@Module({
  controllers: [AdminController, OwnerController, StoreController],
  providers: [AdminService, OwnerService, StoreService],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [StoreModule],
  providers: [TableService],
  controllers: [TableController],
  exports: [TableService],
})
export class TableModule {}

import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { StoreModule } from 'src/store/store.module';
import { BuildIncludeService } from 'src/utils/query-params/build-include';

@Module({
  imports: [StoreModule],
  providers: [TableService, BuildIncludeService],
  controllers: [TableController],
  exports: [TableService],
})
export class TableModule {}

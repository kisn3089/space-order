import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { StoreModule } from 'src/store/store.module';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';

@Module({
  imports: [StoreModule],
  providers: [TableService, QueryParamsBuilderService],
  controllers: [TableController],
  exports: [TableService],
})
export class TableModule {}

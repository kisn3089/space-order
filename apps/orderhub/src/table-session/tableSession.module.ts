import { Module } from '@nestjs/common';
import { TableSessionService } from './tableSession.service';
import { TableSessionController } from './tableSession.controller';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';

@Module({
  controllers: [TableSessionController],
  providers: [TableSessionService, QueryParamsBuilderService],
  exports: [TableSessionService],
})
export class TableSessionModule {}

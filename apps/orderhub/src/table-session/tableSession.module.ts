import { Module } from '@nestjs/common';
import { TableSessionService } from './tableSession.service';
import { TableSessionController } from './tableSession.controller';
import { BuildIncludeService } from 'src/utils/query-params/build-include';

@Module({
  controllers: [TableSessionController],
  providers: [TableSessionService, BuildIncludeService],
  exports: [TableSessionService],
})
export class TableSessionModule {}

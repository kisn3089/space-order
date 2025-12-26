import { Module } from '@nestjs/common';
import { TableSessionService } from './tableSession.service';
import { TableSessionController } from './tableSession.controller';

@Module({
  controllers: [TableSessionController],
  providers: [TableSessionService],
})
export class TableSessionModule {}

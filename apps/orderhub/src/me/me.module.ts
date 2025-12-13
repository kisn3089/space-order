import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { OwnerModule } from 'src/owner/owner.module';

@Module({
  imports: [OwnerModule],
  controllers: [MeController],
})
export class MeModule {}

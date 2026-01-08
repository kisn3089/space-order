import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { OwnerModule } from 'src/owner/owner.module';
import { MeService } from './me.service';

@Module({
  imports: [OwnerModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}

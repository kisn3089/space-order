import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from '../token/token.module';
import { AdminModule } from '../admin/admin.module';
import { OwnerModule } from '../owner/owner.module';
import { MeModule } from 'src/me/me.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AdminModule,
    OwnerModule,
    TokenModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

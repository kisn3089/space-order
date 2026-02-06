import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from '../admin/admin.module';
import { OwnerModule } from '../owner/owner.module';
import { MeModule } from 'src/me/me.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { APP_FILTER, RouterModule } from '@nestjs/core';
import { GlobalExceptionFilter } from 'src/common/filters/exception.filter';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule, // PrismaModule is Global Module
    MeModule,
    AdminModule,
    OwnerModule,
    CustomerModule,

    RouterModule.register([
      { path: 'admin/v1', module: AdminModule },
      { path: 'owner/v1', module: OwnerModule },
      { path: 'customer/v1', module: CustomerModule },
    ]),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from '../token/token.module';
import { AdminModule } from '../admin/admin.module';
import { OwnerModule } from '../owner/owner.module';
import { MeModule } from 'src/me/me.module';
import { TableModule } from 'src/table/table.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TableSessionModule } from 'src/table-session/tableSession.module';
import { StoreModule } from 'src/store/store.module';
import { OrderModule } from 'src/order/order.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from 'src/common/filters/exception.filter';
import { MenuModule } from 'src/menu/menu.module';
import { OrderItemModule } from 'src/order-item/orderItem.module';
import { OwnerOrderModule } from 'src/owner-order/ownerOrder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule, // PrismaModule is Global Module
    AdminModule,
    MenuModule,
    OwnerModule,
    OwnerOrderModule,
    TokenModule,
    StoreModule,
    OrderModule,
    OrderItemModule,
    MeModule,
    TableModule,
    TableSessionModule,
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

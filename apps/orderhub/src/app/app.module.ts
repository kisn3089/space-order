import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OwnerModule } from '../owner/owner.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { APP_FILTER, RouterModule } from '@nestjs/core';
import { GlobalExceptionFilter } from 'src/common/filters/exception.filter';
import { CustomerModule } from 'src/customer/customer.module';
import { AuthModule } from 'src/auth/auth.module';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule, // PrismaModule is Global Module
    AuthModule,
    IdentityModule,
    OwnerModule,
    CustomerModule,

    RouterModule.register([
      { path: 'auth/v1', module: AuthModule },
      { path: 'identity/v1', module: IdentityModule },
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

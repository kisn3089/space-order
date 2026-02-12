import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { StoreModule } from "../store/store.module";
import { OrderModule } from "../order/order.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { APP_FILTER, RouterModule } from "@nestjs/core";
import { GlobalExceptionFilter } from "src/common/filters/exception.filter";
import { AuthModule } from "src/auth/auth.module";
import { IdentityModule } from "src/identity/identity.module";
import { InternalModule } from "src/internal/internal.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env"],
    }),
    PrismaModule,
    InternalModule,
    AuthModule,
    IdentityModule,
    StoreModule,
    OrderModule,

    RouterModule.register([
      { path: "auth/v1", module: AuthModule },
      { path: "identity/v1", module: IdentityModule },
      { path: "stores/v1", module: StoreModule },
      { path: "orders/v1", module: OrderModule },
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

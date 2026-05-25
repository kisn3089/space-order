import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "src/auth/auth.module";
import { OrderEventsService } from "./order-events.service";
import { RealtimeGateway } from "./realtime.gateway";
import { WsAuthService } from "./ws-auth";

@Module({
  imports: [JwtModule, AuthModule],
  providers: [RealtimeGateway, WsAuthService, OrderEventsService],
  exports: [OrderEventsService],
})
export class RealtimeModule {}

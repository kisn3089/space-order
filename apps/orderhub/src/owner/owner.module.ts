import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './auth/strategies/local-sign-in.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './auth/strategies/jwt-refresh-strategy';
import { GenerateTokenService } from 'src/utils/jwt/token-config';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { StoreController } from './store/store.controller';
import { StoreService } from './store/store.service';
import { MenuController } from './menu/menu.controller';
import { MenuService } from './menu/menu.service';
import { TableController } from './table/table.controller';
import { TableService } from './table/table.service';
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';
import { OrderItemController } from './order-item/orderItem.controller';
import { OrderItemService } from './order-item/orderItem.service';
import { OwnerOrderController } from './owner-order/owner-order.controller';
import { OwnerOrderService } from './owner-order/owner-order.service';

@Module({
  imports: [PassportModule, JwtModule],
  controllers: [
    AuthController,
    StoreController,
    MenuController,
    TableController,
    SessionController,
    OrderItemController,
    OwnerOrderController,
  ],
  providers: [
    AuthService,
    StoreService,
    MenuService,
    TableService,
    SessionService,
    OrderItemService,
    OwnerOrderService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GenerateTokenService,
    QueryParamsBuilderService,
  ],
})
export class OwnerModule {}

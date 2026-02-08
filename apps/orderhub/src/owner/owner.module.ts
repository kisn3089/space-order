import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
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
    StoreController,
    MenuController,
    TableController,
    SessionController,
    OrderItemController,
    OwnerOrderController,
  ],
  providers: [
    StoreService,
    MenuService,
    TableService,
    SessionService,
    OrderItemService,
    OwnerOrderService,
  ],
})
export class OwnerModule {}

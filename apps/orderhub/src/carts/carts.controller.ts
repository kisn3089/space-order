import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Cart, SessionWithTable, SyncNotice } from "@spaceorder/db";
import {
  addCartItemPayloadSchema,
  cartItemIdSchema,
  updateCartItemPayloadSchema,
} from "@spaceorder/api/schemas";
import { ZodValidation } from "src/utils/guards/zod-validation.guard";
import { SessionAuth } from "src/utils/guards/table-session-auth.guard";
import { Session } from "src/decorators/session.decorator";
import { CartService } from "./carts.service";
import {
  CreateCartItemPayloadDto,
  UpdateCartItemPayloadDto,
} from "src/dto/cart.dto";
import {
  DocsCustomerCartGet,
  DocsCustomerCartAddItem,
  DocsCustomerCartUpdateItem,
  DocsCustomerCartRemoveItem,
  DocsCustomerCartClear,
} from "src/docs/cart.docs";
import { CartEventsService } from "src/realtime/cart-events.service";

@ApiTags("Customer Cart")
@Controller("sessions/carts")
@UseGuards(SessionAuth)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly cartEvents: CartEventsService
  ) {}

  @Get()
  @DocsCustomerCartGet()
  async getCartList(@Session() session: SessionWithTable): Promise<Cart> {
    return this.cartService.getCartList(session.sessionToken);
  }

  @Post()
  @UseGuards(ZodValidation({ body: addCartItemPayloadSchema }))
  @DocsCustomerCartAddItem()
  async addItem(
    @Session() session: SessionWithTable,
    @Body() addCartItemPayload: CreateCartItemPayloadDto,
    @Headers("x-socket-id") socketId?: string
  ): Promise<Cart> {
    const { cart, subscriber, meta } = await this.cartService.addItem(
      session,
      addCartItemPayload
    );

    const notice: SyncNotice = {
      level: "info",
      message: {
        customer: `${meta.menuName} 메뉴가 장바구니에 추가되었습니다.`,
      },
    };

    this.cartEvents.emitCartAdd({
      subscriber: subscriber,
      payload: { notice, updatedAt: new Date(cart.updatedAt).toISOString() },
      excludeSocketId: socketId,
    });

    return cart;
  }

  @Patch(":cartItemId")
  @UseGuards(
    ZodValidation({
      params: cartItemIdSchema,
      body: updateCartItemPayloadSchema,
    })
  )
  @DocsCustomerCartUpdateItem()
  async updateItem(
    @Session() session: SessionWithTable,
    @Param("cartItemId") cartItemId: string,
    @Body() updateCartItemPayload: UpdateCartItemPayloadDto,
    @Headers("x-socket-id") socketId?: string
  ): Promise<Cart> {
    const { cart, subscriber } = await this.cartService.updateItem(
      session,
      cartItemId,
      updateCartItemPayload
    );

    this.cartEvents.emitCartUpdated({
      subscriber,
      payload: { updatedAt: new Date(cart.updatedAt).toISOString() },
      excludeSocketId: socketId,
    });
    return cart;
  }

  @Delete(":cartItemId")
  @UseGuards(ZodValidation({ params: cartItemIdSchema }))
  @DocsCustomerCartRemoveItem()
  async removeItem(
    @Session() session: SessionWithTable,
    @Param("cartItemId") cartItemId: string,
    @Headers("x-socket-id") socketId?: string
  ): Promise<Cart> {
    const { cart, subscriber, meta } = await this.cartService.removeItem(
      session,
      cartItemId
    );

    const notice: SyncNotice = {
      level: "info",
      message: {
        customer: `${meta.menuName} 메뉴가 장바구니에서 제거되었습니다.`,
      },
    };

    this.cartEvents.emitCartDeleted({
      subscriber,
      payload: { notice, updatedAt: new Date(cart.updatedAt).toISOString() },
      excludeSocketId: socketId,
    });
    return cart;
  }

  @Delete()
  @DocsCustomerCartClear()
  async clearCart(
    @Session() session: SessionWithTable,
    @Headers("x-socket-id") socketId?: string
  ): Promise<void> {
    const subscriber = await this.cartService.clearCart(session);
    this.cartEvents.emitCartCleared({
      subscriber,
      payload: { updatedAt: new Date().toISOString() },
      excludeSocketId: socketId,
    });
  }
}

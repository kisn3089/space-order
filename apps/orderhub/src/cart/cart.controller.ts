import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { TableSession } from "@spaceorder/db";
import {
  addCartItemPayloadSchema,
  sessionAndCartItemIdParamsSchema,
  sessionTokenParamsSchema,
  updateCartItemPayloadSchema,
} from "@spaceorder/api/schemas";
import { ZodValidation } from "src/utils/guards/zod-validation.guard";
import { SessionAuth } from "src/utils/guards/table-session-auth.guard";
import { Session } from "src/decorators/session.decorator";
import type { CartData } from "./cart.service";
import { CartService } from "./cart.service";
import {
  CreateCartItemPayloadDto,
  UpdateCartItemPayloadDto,
} from "src/dto/cart.dto";

@ApiTags("Customer Cart")
@Controller("sessions/:sessionToken/carts")
@UseGuards(SessionAuth)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(ZodValidation({ params: sessionTokenParamsSchema }))
  async getCart(@Session() session: TableSession): Promise<CartData> {
    return this.cartService.getCart(session.sessionToken);
  }

  @Post()
  @UseGuards(
    ZodValidation({
      params: sessionTokenParamsSchema,
      body: addCartItemPayloadSchema,
    })
  )
  async addItem(
    @Session() session: TableSession,
    @Body() addCartItemPayload: CreateCartItemPayloadDto
  ): Promise<CartData> {
    return this.cartService.addItem(session, addCartItemPayload);
  }

  @Patch(":cartItemId")
  @UseGuards(
    ZodValidation({
      params: sessionAndCartItemIdParamsSchema,
      body: updateCartItemPayloadSchema,
    })
  )
  async updateItem(
    @Session() session: TableSession,
    @Param("cartItemId") cartItemId: string,
    @Body() updateCartItemPayload: UpdateCartItemPayloadDto
  ): Promise<CartData> {
    return this.cartService.updateItem(
      session,
      cartItemId,
      updateCartItemPayload
    );
  }

  @Delete(":cartItemId")
  @UseGuards(ZodValidation({ params: sessionAndCartItemIdParamsSchema }))
  async removeItem(
    @Session() session: TableSession,
    @Param("cartItemId") cartItemId: string
  ): Promise<CartData> {
    return this.cartService.removeItem(session, cartItemId);
  }

  @Delete()
  @UseGuards(ZodValidation({ params: sessionTokenParamsSchema }))
  async clearCart(@Session() session: TableSession): Promise<void> {
    return this.cartService.clearCart(session);
  }
}

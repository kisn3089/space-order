import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { storeIdAndSessionTokenSchema } from "@spaceorder/api/schemas";
import { ZodValidation } from "src/utils/guards/zod-validation.guard";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { StoreAccessGuard } from "src/utils/guards/store-access.guard";
import type { CartData } from "./cart.service";
import { CartService } from "./cart.service";
import { SessionAuth } from "src/utils/guards/table-session-auth.guard";

@ApiTags("Owner Cart")
@Controller(":storeId/sessions/:sessionToken/carts")
@UseGuards(JwtAuthGuard, StoreAccessGuard, SessionAuth)
export class CartOwnerController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(ZodValidation({ params: storeIdAndSessionTokenSchema }))
  async getCart(
    @Param("storeId") storeId: string,
    @Param("sessionToken") sessionToken: string
  ): Promise<CartData> {
    return this.cartService.getCartByStore(storeId, sessionToken);
  }
}

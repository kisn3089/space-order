import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
import type {
  Cart,
  PublicCartItem,
  SessionWithTable,
  TableSession,
} from "@spaceorder/db";
import type Redis from "ioredis";
import Redlock from "redlock";
import { cartSchema } from "@spaceorder/api";
import { PrismaService } from "src/prisma/prisma.service";
import { exceptionContentsIs } from "src/common/constants/exceptionContents";
import { REDIS_CLIENT, REDLOCK_CLIENT } from "../redis/redis.provider";
import { validateMenuAvailableOrThrow } from "src/common/validate/menu/available";
import { getValidatedMenuOptionsSnapshot } from "src/common/validate/menu/options";
import {
  CreateCartItemPayloadDto,
  UpdateCartItemPayloadDto,
} from "src/dto/cart.dto";
import { CartSubscriber } from "src/realtime/cart-events.service";
import { MetaInfo } from "src/realtime/realtime.constants";

type ReturnCart<Meta = unknown> = {
  cart: Cart;
  subscriber: CartSubscriber;
} & MetaInfo<Meta>;

@Injectable()
export class CartService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(REDLOCK_CLIENT) private readonly redlock: Redlock,
    private readonly prismaService: PrismaService
  ) {}

  private cartKey(sessionToken: string) {
    return `cart:${sessionToken}`;
  }

  private cartLockKey(sessionToken: string) {
    return `lock:${this.cartKey(sessionToken)}`;
  }

  private ttlSeconds(expiresAt: Date) {
    return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  }

  private subscriberOf(session: SessionWithTable): CartSubscriber {
    return {
      storePublicId: session.table.store.publicId,
      tablePublicId: session.table.publicId,
    };
  }

  private async withCartLock<T>(
    sessionToken: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const lock = await this.redlock
      .acquire([this.cartLockKey(sessionToken)], 3000)
      .catch(() => {
        throw new HttpException(
          exceptionContentsIs("CART_LOCK_FAILED"),
          HttpStatus.SERVICE_UNAVAILABLE
        );
      });

    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }

  private async readCart(sessionToken: string): Promise<Cart> {
    const defaultCart: Cart = {
      sessionToken,
      menus: [],
      updatedAt: "",
    };

    const raw =
      (await this.redis.get(this.cartKey(sessionToken))) ||
      JSON.stringify(defaultCart);

    try {
      const jsonParsed = JSON.parse(raw);
      return cartSchema.parse(jsonParsed);
    } catch {
      await this.redis.del(this.cartKey(sessionToken));
      throw new HttpException(
        exceptionContentsIs("CART_JSON_PARSE_ERROR"),
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }
  }

  private async writeCart(session: TableSession, cart: Cart): Promise<Cart> {
    const ttl = this.ttlSeconds(session.expiresAt);
    if (ttl <= 0) {
      throw new HttpException(
        exceptionContentsIs("SESSION_EXPIRED"),
        HttpStatus.BAD_REQUEST
      );
    }

    cart.updatedAt = new Date().toISOString();
    await this.redis.setex(
      this.cartKey(session.sessionToken),
      ttl,
      JSON.stringify(cart)
    );

    return cart;
  }

  async getCartList(sessionToken: string): Promise<Cart> {
    return this.readCart(sessionToken);
  }

  private async getOptionsPriceWithValidate(
    session: TableSession,
    menuPublicId: string,
    options: {
      requiredOptions?: Record<string, string>;
      customOptions?: Record<string, string>;
    }
  ) {
    const menu = await this.prismaService.menu.findFirstOrThrow({
      where: {
        publicId: menuPublicId,
        deletedAt: null,
        category: {
          store: { tables: { some: { id: session.tableId } } },
        },
      },
    });

    validateMenuAvailableOrThrow(menu);

    return {
      menu,
      ...getValidatedMenuOptionsSnapshot(menu, {
        requiredOptions: options.requiredOptions,
        customOptions: options.customOptions,
      }),
    };
  }

  async addItem(
    sessionWithTable: SessionWithTable,
    payload: CreateCartItemPayloadDto
  ): Promise<ReturnCart<{ menuName: string }>> {
    const { optionsPrice, menu } = await this.getOptionsPriceWithValidate(
      sessionWithTable,
      payload.menuPublicId,
      {
        requiredOptions: payload.requiredOptions,
        customOptions: payload.customOptions,
      }
    );

    const item: PublicCartItem = {
      id: createId(),
      menuPublicId: menu.publicId,
      menuName: menu.name,
      menuImageUrl: menu.imageUrl,
      basePrice: menu.price,
      optionsPrice,
      unitPrice: menu.price + optionsPrice,
      quantity: payload.quantity,
      ...(payload.requiredOptions && {
        requiredOptions: payload.requiredOptions,
      }),
      ...(payload.customOptions && { customOptions: payload.customOptions }),
      addedAt: new Date().toISOString(),
    };

    return this.withCartLock(sessionWithTable.sessionToken, async () => {
      const cart = await this.readCart(sessionWithTable.sessionToken);
      cart.menus.push(item);
      const updated = await this.writeCart(sessionWithTable, cart);

      return {
        cart: updated,
        subscriber: this.subscriberOf(sessionWithTable),
        meta: { menuName: menu.name },
      };
    });
  }

  async updateItem(
    sessionWithTable: SessionWithTable,
    cartItemId: string,
    payload: UpdateCartItemPayloadDto
  ): Promise<ReturnCart> {
    const preCart = await this.readCart(sessionWithTable.sessionToken);
    const preItem = preCart.menus.find((i) => i.id === cartItemId);
    if (!preItem) {
      throw new HttpException(
        exceptionContentsIs("CART_ITEM_NOT_FOUND"),
        HttpStatus.NOT_FOUND
      );
    }

    const { optionsPrice, menu } = await this.getOptionsPriceWithValidate(
      sessionWithTable,
      preItem.menuPublicId,
      {
        requiredOptions:
          payload.requiredOptions ?? preItem.requiredOptions ?? undefined,
        customOptions:
          payload.customOptions ?? preItem.customOptions ?? undefined,
      }
    );

    return this.withCartLock(sessionWithTable.sessionToken, async () => {
      const cart = await this.readCart(sessionWithTable.sessionToken);
      const itemIndex = cart.menus.findIndex((i) => i.id === cartItemId);
      if (itemIndex === -1) {
        throw new HttpException(
          exceptionContentsIs("CART_ITEM_NOT_FOUND"),
          HttpStatus.NOT_FOUND
        );
      }

      const item = cart.menus[itemIndex];

      const { requiredOptions, customOptions } = {
        requiredOptions: payload.requiredOptions ?? item.requiredOptions,
        customOptions: payload.customOptions ?? item.customOptions,
      };

      cart.menus[itemIndex] = {
        ...item,
        basePrice: menu.price,
        optionsPrice,
        unitPrice: menu.price + optionsPrice,
        quantity: payload.quantity ?? item.quantity,
        ...(requiredOptions && { requiredOptions }),
        ...(customOptions && { customOptions }),
      };

      const updated = await this.writeCart(sessionWithTable, cart);

      return { cart: updated, subscriber: this.subscriberOf(sessionWithTable) };
    });
  }

  async removeItem(
    sessionWithTable: SessionWithTable,
    cartItemId: string
  ): Promise<ReturnCart<{ menuName: string }>> {
    return this.withCartLock(sessionWithTable.sessionToken, async () => {
      const cart = await this.readCart(sessionWithTable.sessionToken);
      const removed = cart.menus.find((i) => i.id === cartItemId);
      if (!removed) {
        throw new HttpException(
          exceptionContentsIs("CART_ITEM_NOT_FOUND"),
          HttpStatus.NOT_FOUND
        );
      }

      cart.menus = cart.menus.filter((i) => i.id !== cartItemId);
      const updated = await this.writeCart(sessionWithTable, cart);

      return {
        cart: updated,
        subscriber: this.subscriberOf(sessionWithTable),
        meta: { menuName: removed.menuName },
      };
    });
  }

  async clearCart(sessionWithTable: SessionWithTable): Promise<CartSubscriber> {
    return this.withCartLock(sessionWithTable.sessionToken, async () => {
      await this.redis.del(this.cartKey(sessionWithTable.sessionToken));
      return this.subscriberOf(sessionWithTable);
    });
  }

  async getCartByStore(storeId: string, sessionToken: string): Promise<Cart> {
    const session = await this.prismaService.tableSession.findFirst({
      where: {
        sessionToken,
        table: { store: { publicId: storeId } },
      },
    });

    if (!session) {
      throw new HttpException(
        exceptionContentsIs("INVALID_TABLE_SESSION"),
        HttpStatus.NOT_FOUND
      );
    }

    return this.readCart(sessionToken);
  }
}

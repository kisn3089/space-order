import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
import type { PublicCartItem, TableSession } from "@spaceorder/db";
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

export type CartData = {
  sessionToken: string;
  items: PublicCartItem[];
  updatedAt: string;
};

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

  private async readCart(sessionToken: string): Promise<CartData> {
    const raw = await this.redis.get(this.cartKey(sessionToken));

    if (!raw) {
      throw new HttpException(
        exceptionContentsIs("CART_ITEM_NOT_FOUND"),
        HttpStatus.NOT_FOUND
      );
    }

    try {
      const jsonParsed = JSON.parse(raw);
      return cartSchema.parse(jsonParsed);
    } catch {
      await this.redis.del(this.cartKey(sessionToken));
      throw new HttpException(
        exceptionContentsIs("CART_JSON_PARSE_ERROR"),
        HttpStatus.NOT_FOUND
      );
    }
  }

  private async writeCart(
    session: TableSession,
    cart: CartData
  ): Promise<CartData> {
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

  async getCart(sessionToken: string): Promise<CartData> {
    return this.readCart(sessionToken);
  }

  private async getOptionsPrice(
    menuPublicId: string,
    options: {
      requiredOptions?: Record<string, string>;
      customOptions?: Record<string, string>;
    }
  ) {
    const menu = await this.prismaService.menu.findFirstOrThrow({
      where: { publicId: menuPublicId, deletedAt: null },
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
    session: TableSession,
    payload: CreateCartItemPayloadDto
  ): Promise<CartData> {
    const { optionsPrice, menu } = await this.getOptionsPrice(
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
      basePrice: menu.price,
      optionsPrice,
      unitPrice: menu.price + optionsPrice,
      quantity: payload.quantity,
      requiredOptions: payload.requiredOptions || null,
      customOptions: payload.customOptions || null,
      addedAt: new Date().toISOString(),
    };

    const lock = await this.redlock
      .acquire([this.cartLockKey(session.sessionToken)], 3000)
      .catch(() => {
        throw new HttpException(
          exceptionContentsIs("CART_LOCK_FAILED"),
          HttpStatus.SERVICE_UNAVAILABLE
        );
      });

    try {
      const cart = await this.readCart(session.sessionToken);
      cart.items.push(item);
      return this.writeCart(session, cart);
    } catch (error) {
      if (
        error instanceof HttpException &&
        error.getStatus() === Number(HttpStatus.NOT_FOUND)
      ) {
        const newCart: CartData = {
          sessionToken: session.sessionToken,
          items: [item],
          updatedAt: new Date().toISOString(),
        };
        return this.writeCart(session, newCart);
      }
      throw error;
    } finally {
      await lock.release();
    }
  }

  async updateItem(
    session: TableSession,
    cartItemId: string,
    payload: UpdateCartItemPayloadDto
  ): Promise<CartData> {
    const lock = await this.redlock
      .acquire([this.cartLockKey(session.sessionToken)], 5000)
      .catch(() => {
        throw new HttpException(
          exceptionContentsIs("CART_LOCK_FAILED"),
          HttpStatus.SERVICE_UNAVAILABLE
        );
      });

    try {
      const cart = await this.readCart(session.sessionToken);

      const itemIndex = cart.items.findIndex((i) => i.id === cartItemId);
      if (itemIndex === -1) {
        throw new HttpException(
          exceptionContentsIs("CART_ITEM_NOT_FOUND"),
          HttpStatus.NOT_FOUND
        );
      }

      const item = cart.items[itemIndex];

      const { optionsPrice, menu } = await this.getOptionsPrice(
        item.menuPublicId,
        {
          requiredOptions:
            payload.requiredOptions || item.requiredOptions || undefined,
          customOptions:
            payload.customOptions || item.customOptions || undefined,
        }
      );

      cart.items[itemIndex] = {
        ...item,
        basePrice: menu.price,
        optionsPrice,
        unitPrice: menu.price + optionsPrice,
        quantity: payload.quantity || item.quantity,
        requiredOptions:
          payload.requiredOptions || item.requiredOptions || null,
        customOptions: payload.customOptions || item.customOptions || null,
      };

      return this.writeCart(session, cart);
    } finally {
      await lock.release();
    }
  }

  async removeItem(
    session: TableSession,
    cartItemId: string
  ): Promise<CartData> {
    const lock = await this.redlock
      .acquire([this.cartLockKey(session.sessionToken)], 3000)
      .catch(() => {
        throw new HttpException(
          exceptionContentsIs("CART_LOCK_FAILED"),
          HttpStatus.SERVICE_UNAVAILABLE
        );
      });

    try {
      const cart = await this.readCart(session.sessionToken);
      const itemExists = cart.items.some((i) => i.id === cartItemId);

      if (!itemExists) {
        throw new HttpException(
          exceptionContentsIs("CART_ITEM_NOT_FOUND"),
          HttpStatus.NOT_FOUND
        );
      }

      cart.items = cart.items.filter((i) => i.id !== cartItemId);
      return this.writeCart(session, cart);
    } finally {
      await lock.release();
    }
  }

  async clearCart(session: TableSession): Promise<void> {
    await this.redis.del(this.cartKey(session.sessionToken));
  }

  async getCartByStore(
    storeId: string,
    sessionToken: string
  ): Promise<CartData> {
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

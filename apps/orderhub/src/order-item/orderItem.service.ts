import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Menu,
  OrderItem,
  OrderStatus,
  Owner,
  Prisma,
  ResponseOrderItem,
} from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderItemDto, UpdateOrderItemDto } from './orderItem.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { ExtendedMap } from 'src/utils/helper/extendMap';
import {
  MenuCustomOption,
  MenuOption,
  MenuOptions,
  menuOptionsSchema,
} from '@spaceorder/api/schemas/model/menu.schema';
import { OptionsSnapshot } from '@spaceorder/api/schemas/model/orderItem.schema';
import { validateEmptyObject } from '@spaceorder/api/utils/validateEmptyObject';

type MenuId = { id: bigint } | { publicId: string };
type JsonMenuOptions = Pick<Menu, 'requiredOptions' | 'customOptions'>;
type CreateItemPayloadOptions = Pick<
  CreateOrderItemDto,
  'requiredOptions' | 'customOptions'
>;
type ValidatedMenuOptionsReturn<
  Option extends MenuOption[] | MenuCustomOption,
> = {
  optionsSnapshot: Record<
    string,
    Option extends MenuOption[] ? MenuOption : MenuCustomOption
  >;
  optionsPrice: number;
};
type GetValidatedMenuOptionsSnapshotReturn = {
  optionsSnapshot?: OptionsSnapshot;
  optionsPrice: number;
};

@Injectable()
export class OrderItemService {
  constructor(private readonly prismaService: PrismaService) {}

  orderItemOmit = { id: true, orderId: true, menuId: true } as const;

  async createOrderItem(
    orderPublicId: string,
    createPayload: CreateOrderItemDto,
    client: Owner,
  ): Promise<ResponseOrderItem> {
    const { menuPublicId, requiredOptions, customOptions, quantity } =
      createPayload;
    const [findMenu, findOrder] = await Promise.all([
      this.prismaService.menu.findFirstOrThrow(
        this.findMenuFields({ publicId: menuPublicId }, client),
      ),
      this.prismaService.order.findFirstOrThrow(
        this.findOrderFields(orderPublicId),
      ),
    ]);

    const { optionsPrice, optionsSnapshot } =
      this.getValidatedMenuOptionsSnapshot(findMenu, {
        requiredOptions,
        customOptions,
      });

    return await this.prismaService.orderItem.create({
      data: {
        menuId: findMenu.id,
        menuName: findMenu.name,
        basePrice: findMenu.price,
        unitPrice: findMenu.price + optionsPrice,
        optionsPrice,
        quantity,
        orderId: findOrder.id,
        optionsSnapshot,
      },
      omit: this.orderItemOmit,
    });
  }

  private findMenuFields(menuId: MenuId, client: Owner) {
    return {
      where: { ...menuId, store: { ownerId: client.id }, deletedAt: null },
      select: {
        id: true,
        name: true,
        price: true,
        requiredOptions: true,
        customOptions: true,
      },
    };
  }

  private findOrderFields(orderPublicId: string) {
    return {
      where: { publicId: orderPublicId },
      select: { id: true },
    };
  }

  private parseMenuOptions(menu: JsonMenuOptions): MenuOptions {
    return menuOptionsSchema.parse({
      requiredOptions: menu.requiredOptions,
      customOptions: menu.customOptions,
    });
  }

  getValidatedMenuOptionsSnapshot(
    menuOptions: JsonMenuOptions,
    payloadOptions: CreateItemPayloadOptions,
  ): GetValidatedMenuOptionsSnapshotReturn {
    const parsedMenuOptions: MenuOptions = this.parseMenuOptions(menuOptions);
    const {
      customOptions: payloadCustomOptions,
      requiredOptions: payloadRequiredOptions,
    } = payloadOptions;

    /** 필수 옵션의 수와, payload의 수가 다르면 예외 처리 */
    const requiredMenuOptionsKeys = Object.keys(
      parsedMenuOptions.requiredOptions || {},
    );
    const payloadRequiredOptionsKeys = Object.keys(
      payloadRequiredOptions || {},
    );
    if (requiredMenuOptionsKeys.length !== payloadRequiredOptionsKeys.length) {
      throw new HttpException(
        {
          ...exceptionContentsIs('MENU_OPTIONS_REQUIRED'),
          details: {
            missingRequiredOptions: requiredMenuOptionsKeys,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    /** Menu는 custom 옵션은 없는데, payload의 custom 옵션이 있다면 예외 처리 */
    const payloadCustomOptionsKeys = Object.keys(payloadCustomOptions || {});
    if (
      !parsedMenuOptions.customOptions &&
      payloadCustomOptionsKeys.length > 0
    ) {
      throw new HttpException(
        {
          ...exceptionContentsIs('MENU_OPTIONS_SHOULD_BE_EMPTY'),
          details: {
            shouldBeEmptyOptions: payloadCustomOptionsKeys,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (requiredMenuOptionsKeys.length === 0) {
      return { optionsPrice: 0 };
    }

    const {
      optionsPrice: requiredOptionsPrice,
      optionsSnapshot: requiredOptionsSnapshot,
    } = this.getValidatedMenuOptions<MenuOption[]>(
      parsedMenuOptions.requiredOptions,
      payloadRequiredOptions,
    );

    const {
      optionsPrice: customOptionsPrice,
      optionsSnapshot: customOptionsSnapshot,
    } = this.getValidatedMenuOptions<MenuCustomOption>(
      parsedMenuOptions.customOptions,
      payloadCustomOptions,
    );

    return {
      optionsSnapshot: {
        ...(!validateEmptyObject(requiredOptionsSnapshot) && {
          requiredOptions: requiredOptionsSnapshot,
        }),
        ...(!validateEmptyObject(customOptionsSnapshot) && {
          customOptions: customOptionsSnapshot,
        }),
      },
      optionsPrice: requiredOptionsPrice + customOptionsPrice,
    };
  }

  private getValidatedMenuOptions<
    ValidMenuOption extends MenuOption[] | MenuCustomOption,
  >(
    menuOption: Record<string, ValidMenuOption> | null,
    payloadOption: CreateItemPayloadOptions[
      | 'requiredOptions'
      | 'customOptions'] = {},
  ): ValidatedMenuOptionsReturn<ValidMenuOption> {
    const menuOptionsMap = new ExtendedMap<string, ValidMenuOption>(
      Object.entries(menuOption || {}),
    );
    const payloadMenuMap = new Map<string, string>(
      Object.entries(payloadOption || {}),
    );

    menuOptionsMap.setException('MENU_OPTIONS_INVALID');

    const validatedOptions = { optionsPrice: 0, optionsSnapshot: {} };
    payloadMenuMap.forEach((payloadValue, payloadKey) => {
      const menuOptions = menuOptionsMap.getOrThrow(payloadKey);
      const optionArray = Array.isArray(menuOptions)
        ? menuOptions
        : menuOptions.options;

      const findOption = optionArray.find(
        (option) => option.key === payloadValue,
      );

      if (!findOption) {
        throw new HttpException(
          {
            ...exceptionContentsIs('MENU_OPTIONS_INVALID'),
            details: { invalidRequiredOption: payloadValue },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      validatedOptions.optionsPrice += findOption.price;
      validatedOptions.optionsSnapshot[payloadKey] = findOption;
    });
    return validatedOptions;
  }

  async getOrderItemList<T extends Prisma.OrderItemFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderItemFindManyArgs>,
  ): Promise<Prisma.OrderItemGetPayload<T>[]> {
    return await this.prismaService.orderItem.findMany(args);
  }

  async getOrderItemUnique<T extends Prisma.OrderItemFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderItemFindFirstOrThrowArgs>,
  ): Promise<Prisma.OrderItemGetPayload<T>> {
    return await this.prismaService.orderItem.findFirstOrThrow(args);
  }

  async partialUpdateOrderItem(
    orderItemPublicId: string,
    updatePayload: UpdateOrderItemDto,
    client: Owner,
    cachedOrderItem: OrderItem,
  ): Promise<ResponseOrderItem> {
    const { menuPublicId, requiredOptions, customOptions, quantity } =
      updatePayload;
    if (!menuPublicId && !requiredOptions && !customOptions) {
      return await this.prismaService.orderItem.update({
        where: { publicId: orderItemPublicId },
        data: updatePayload,
        omit: this.orderItemOmit,
      });
    }

    const menuId = menuPublicId
      ? { publicId: menuPublicId }
      : { id: cachedOrderItem.menuId };
    const findMenu = await this.prismaService.menu.findFirstOrThrow(
      this.findMenuFields(menuId, client),
    );

    const { optionsPrice, optionsSnapshot } =
      this.getValidatedMenuOptionsSnapshot(findMenu, {
        requiredOptions,
        customOptions,
      });

    return await this.prismaService.orderItem.update({
      where: { publicId: orderItemPublicId },
      data: {
        menu: { connect: { id: findMenu.id } },
        menuName: findMenu.name,
        basePrice: findMenu.price,
        unitPrice: findMenu.price + optionsPrice,
        optionsPrice,
        quantity,
        optionsSnapshot,
      },
      omit: this.orderItemOmit,
    });
  }

  async deleteOrderItem(
    orderItemPublicId: string,
    cachedOrderItem: OrderItem,
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      await tx.orderItem.delete({ where: { publicId: orderItemPublicId } });

      const remainingItems = await tx.orderItem.count({
        where: { orderId: cachedOrderItem.orderId },
      });

      if (remainingItems === 0) {
        /**
         * order.cancelOrder 메서드와 다르게 살아있는 tableSession임을 검증하지 않는 이유는
         * controller에서 OrderItemWritePermission 가드가 이미 검증을 수행했기 때문이다.
         *
         * @see orderService.cancelOrder
         * @see OrderItemWritePermission
         */
        await tx.order.update({
          where: { id: cachedOrderItem.orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      }
    });
  }
}

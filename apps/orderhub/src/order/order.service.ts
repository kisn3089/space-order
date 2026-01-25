import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Menu,
  OrderStatus,
  Prisma,
  ResponseOrderWithItem,
  ResponseTableSession,
  SessionWithTable,
  TableSessionStatus,
} from '@spaceorder/db';
import { TableSessionService } from 'src/table-session/tableSession.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './order.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { ExtendedMap } from 'src/utils/helper/extendMap';

type MenuValidationFields = Pick<
  Menu,
  'publicId' | 'name' | 'price' | 'requiredOptions' | 'customOptions'
>;
type CreateOrderReturn = {
  createdOrder: ResponseOrderWithItem;
  updatedTableSession: ResponseTableSession;
};

type PublicOrderId = {
  orderPublicId: string;
};

type ParamsPrincipal =
  | {
      type: 'CUSTOMER';
      params: { tableSession: SessionWithTable };
    }
  | {
      type: 'OWNER' | 'WRITE';
      params: { tablePublicId: string; storePublicId: string; ownerId: bigint };
    };

type CreateOrderParams =
  | { tableSession: SessionWithTable; tableId?: never }
  | { tableSession?: never; tableId: string };

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tableSessionService: TableSessionService,
  ) {}

  private orderIncludeOrOmit = {
    include: {
      orderItems: { omit: { id: true, orderId: true, menuId: true } },
    },
    omit: {
      id: true,
      storeId: true,
      tableId: true,
      tableSessionId: true,
    },
  } as const;

  async createOrder(
    { tableSession, tableId }: CreateOrderParams,
    createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderReturn> {
    return await this.prismaService.$transaction(async (tx) => {
      const sessionFromCookieOrCreated: SessionWithTable =
        tableSession ??
        (await this.tableSessionService.txFindActivatedSessionOrCreate(
          tx,
          tableId,
        ));

      const menuPublicIds = createOrderDto.orderItems.map(
        (item) => item.menuPublicId,
      );

      /** TODO: 별도의 클래스로 분리 [checkMenuValidation] */
      const findMenuList = await tx.menu.findMany({
        where: { publicId: { in: menuPublicIds } },
        select: {
          publicId: true,
          name: true,
          price: true,
          requiredOptions: true,
          customOptions: true,
        },
      });

      const bulkCreateOrderItems = this.createOrderItemsWithValidMenu(
        createOrderDto,
        findMenuList,
        menuPublicIds,
      );

      const updatedTableSession =
        sessionFromCookieOrCreated.status !== TableSessionStatus.ACTIVE
          ? await this.tableSessionService.txUpdateSession(
              sessionFromCookieOrCreated,
              { status: TableSessionStatus.ACTIVE },
              tx,
            )
          : sessionFromCookieOrCreated;

      const createdOrder = await tx.order.create({
        data: {
          storeId: sessionFromCookieOrCreated.table.storeId,
          tableId: sessionFromCookieOrCreated.table.id,
          tableSessionId: sessionFromCookieOrCreated.id,
          orderItems: { create: bulkCreateOrderItems },
          memo: createOrderDto.memo,
        },
        ...this.orderIncludeOrOmit,
      });

      return {
        createdOrder,
        updatedTableSession,
      };
    });
  }

  private createOrderItemsWithValidMenu(
    createOrderDto: CreateOrderDto,
    findMenuList: MenuValidationFields[],
    menuPublicIds: string[],
  ) {
    const menuMap = new ExtendedMap<string, MenuValidationFields>(
      findMenuList.map((menu) => [menu.publicId, menu]),
    );
    menuMap.setException('MENU_MISMATCH');

    if (findMenuList.length !== menuPublicIds.length) {
      this.checkInvalidMenuWithException(findMenuList, menuPublicIds);
    }

    const bulkCreateOrderItems: Prisma.OrderItemCreateNestedManyWithoutOrderInput['create'] =
      createOrderDto.orderItems.map((orderItem) => {
        const menu = menuMap.getOrThrow(orderItem.menuPublicId);
        if (
          orderItem.options &&
          !(menu.requiredOptions || menu.customOptions)
        ) {
          throw new HttpException(
            exceptionContentsIs('ORDER_ITEM_OPTIONS_INVALID'),
            HttpStatus.BAD_REQUEST,
          );
        }

        return {
          menu: { connect: { publicId: orderItem.menuPublicId } },
          menuName: menu.name,
          price: menu.price,
          quantity: orderItem.quantity,
          ...(orderItem.options ? { options: orderItem.options } : {}),
        };
      });

    return bulkCreateOrderItems;
  }

  private checkInvalidMenuWithException(
    findMenuList: MenuValidationFields[],
    menuPublicIds: string[],
  ): void {
    const extractedIds = new Set(findMenuList.map((m) => m.publicId));
    const missingIds = menuPublicIds.filter((id) => !extractedIds.has(id));
    throw new HttpException(
      {
        ...exceptionContentsIs('MENU_MISMATCH'),
        details: { missingMenuIds: missingIds },
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async getOrderList(
    principal: ParamsPrincipal,
  ): Promise<ResponseOrderWithItem[]> {
    return await this.prismaService.order.findMany({
      where: this.whereRecordByPrincipal(principal),
      ...this.orderIncludeOrOmit,
    });
  }

  private whereRecordByPrincipal({ params, type }: ParamsPrincipal) {
    if (type === 'CUSTOMER') {
      return { tableSessionId: params.tableSession.id };
    } else {
      /** type === 'OWNER' */
      /** TODO: 기본 조회는 모든 orders를 응답.
       *  query에(alive) 따라 활성화된 테이블 세션으로 제한이 필요
       */

      const writeAccessCondition =
        type === 'WRITE'
          ? {
              expiresAt: { gt: new Date() },
              status: {
                in: [
                  TableSessionStatus.WAITING_ORDER,
                  TableSessionStatus.ACTIVE,
                ],
              },
            }
          : {};

      return {
        tableSession: {
          table: {
            store: { ownerId: params.ownerId, publicId: params.storePublicId },
            publicId: params.tablePublicId,
          },
          ...writeAccessCondition,
        },
      };
    }
  }

  async getOrderUnique(
    principal: ParamsPrincipal & PublicOrderId,
  ): Promise<ResponseOrderWithItem> {
    return await this.prismaService.order.findFirstOrThrow({
      where: {
        publicId: principal.orderPublicId,
        ...this.whereRecordByPrincipal(principal),
      },
      ...this.orderIncludeOrOmit,
    });
  }

  async partialUpdateOrder(
    principal: ParamsPrincipal & PublicOrderId,
    updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseOrderWithItem> {
    const whereByPrincipal = this.whereRecordByPrincipal(principal);
    const updateOrder = updateOrderDto;

    return await this.prismaService.order.update({
      where: { publicId: principal.orderPublicId, ...whereByPrincipal },
      data: updateOrder,
      ...this.orderIncludeOrOmit,
    });
  }

  async cancelOrder(
    principal: ParamsPrincipal & PublicOrderId,
  ): Promise<ResponseOrderWithItem> {
    return await this.prismaService.order.update({
      where: {
        publicId: principal.orderPublicId,
        ...this.whereRecordByPrincipal(principal),
      },
      data: { status: OrderStatus.CANCELLED },
      ...this.orderIncludeOrOmit,
    });
  }
}

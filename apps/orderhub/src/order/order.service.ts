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
import { sumFromObjects } from '@spaceorder/api/utils';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { ExtendedMap } from 'src/utils/helper/extendMap';

type MenuValidationFields = Pick<Menu, 'publicId' | 'name' | 'price'>;
type CreateOrderItemsWithValidMenuReturn = {
  totalPriceByServer: number;
  bulkCreateOrderItems: Prisma.OrderItemCreateNestedManyWithoutOrderInput['create'];
};
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
      type: 'OWNER';
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
      const menuPublicIds = createOrderDto.orderItems.map(
        (item) => item.menuPublicId,
      );

      const sessionFromCookieOrCreated: SessionWithTable =
        tableSession ??
        (await this.tableSessionService.txFindActivatedSessionOrCreate(
          tx,
          tableId,
        ));

      // TODO: 추후 메뉴 service로 이전
      /** TODO: 별도의 클래스로 분리 [checkMenuValidation] */
      const findMenuList = await tx.menu.findMany({
        where: { publicId: { in: menuPublicIds } },
        select: { publicId: true, name: true, price: true },
      });

      const { totalPriceByServer, bulkCreateOrderItems } =
        this.createOrderItemsWithValidMenu(
          createOrderDto,
          findMenuList,
          menuPublicIds,
        );

      const updatedTableSession =
        await this.tableSessionService.txUpdateSession(
          sessionFromCookieOrCreated,
          { status: TableSessionStatus.ACTIVE },
          tx,
        );

      const createdOrder = await tx.order.create({
        data: {
          storeId: sessionFromCookieOrCreated.table.storeId,
          tableId: sessionFromCookieOrCreated.table.id,
          tableSessionId: sessionFromCookieOrCreated.id,
          orderItems: { create: bulkCreateOrderItems },
          totalPrice: totalPriceByServer,
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
  ): CreateOrderItemsWithValidMenuReturn {
    const menuMap = new ExtendedMap<string, MenuValidationFields>(
      findMenuList.map((menu) => [menu.publicId, menu]),
    );
    menuMap.setException('MENU_MISMATCH');

    if (findMenuList.length !== menuPublicIds.length) {
      this.checkInvalidMenuWithException(findMenuList, menuPublicIds);
    }

    const totalPriceByServer = this.getTotalPriceByServerWithException(
      createOrderDto,
      menuMap,
    );

    const bulkCreateOrderItems: Prisma.OrderItemCreateNestedManyWithoutOrderInput['create'] =
      createOrderDto.orderItems.map((orderItem) => {
        const menu = menuMap.getOrThrow(orderItem.menuPublicId);
        return {
          menu: { connect: { publicId: orderItem.menuPublicId } },
          menuName: menu.name,
          price: menu.price,
          quantity: orderItem.quantity,
          ...(orderItem.options ? { options: orderItem.options } : {}),
        };
      });

    return {
      totalPriceByServer,
      bulkCreateOrderItems,
    };
  }

  private checkInvalidMenuWithException(
    findMenuList: Pick<Menu, 'publicId' | 'name' | 'price'>[],
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

  private getTotalPriceByServerWithException(
    createOrderDto: CreateOrderDto,
    menuMap: ExtendedMap<string, MenuValidationFields>,
  ): number {
    const totalPriceByServer = sumFromObjects(
      createOrderDto.orderItems,
      (orderItem) => {
        const menu = menuMap.getOrThrow(orderItem.menuPublicId);
        return menu.price * orderItem.quantity;
      },
    );

    if (
      createOrderDto.totalPrice &&
      totalPriceByServer !== createOrderDto.totalPrice
    ) {
      const details = {
        server: totalPriceByServer,
        client: createOrderDto.totalPrice,
        diff: Math.abs(createOrderDto.totalPrice - totalPriceByServer),
      };
      /** TODO: logger service를 만들어서 로그를 남기도록 변경 필요 */
      console.warn('Total price mismatch:', details);
      throw new HttpException(
        {
          ...exceptionContentsIs('TOTAL_PRICE_MISMATCH'),
          details,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return totalPriceByServer;
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
      return {
        tableSession: {
          table: {
            store: { ownerId: params.ownerId, publicId: params.storePublicId },
            publicId: params.tablePublicId,
          },
          expiresAt: { gte: new Date() },
          status: {
            in: [TableSessionStatus.WAITING_ORDER, TableSessionStatus.ACTIVE],
          },
        },
      };
    }
  }

  async getOrderById(
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

  async updateOrder(
    principal: ParamsPrincipal & PublicOrderId,
    updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseOrderWithItem> {
    return await this.prismaService.$transaction(async (tx) => {
      const whereByPrincipal = this.whereRecordByPrincipal(principal);
      const { orderItems, ...restUpdateOrderDto } = updateOrderDto;
      if (!orderItems) {
        return await tx.order.update({
          where: {
            publicId: principal.orderPublicId,
            ...whereByPrincipal,
          },
          data: restUpdateOrderDto,
          ...this.orderIncludeOrOmit,
        });
      }

      const menuPublicIds = orderItems.map((item) => item.menuPublicId);
      const findMenuList = await tx.menu.findMany({
        where: { publicId: { in: menuPublicIds } },
        select: { publicId: true, name: true, price: true },
      });

      const { totalPriceByServer, bulkCreateOrderItems } =
        this.createOrderItemsWithValidMenu(
          { orderItems, ...restUpdateOrderDto },
          findMenuList,
          menuPublicIds,
        );
      return tx.order.update({
        where: {
          publicId: principal.orderPublicId,
          ...whereByPrincipal,
        },
        data: {
          /**
           *  NOTE: We intentionally delete and recreate all orderItems on update.
           * - OrderItem IDs and foreign keys (id, orderId, menuId) are not exposed
           * in the API and are omitted from the response below,
           * so callers do not depend on stable IDs.
           * - There are no dependent records that require preserving individual OrderItem IDs.
           * - totalPrice is recalculated from the updated items, making this a safe snapshot replace.
           * If future features need per-item history or stable IDs,
           * this logic must be revised.
           */
          orderItems: { deleteMany: {}, create: bulkCreateOrderItems },
          totalPrice: totalPriceByServer,
        },
        ...this.orderIncludeOrOmit,
      });
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

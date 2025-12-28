import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '@spaceorder/db';
import { TableSessionService } from 'src/table-session/tableSession.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tableSessionService: TableSessionService,
  ) {}

  async create(
    storePublicId: string,
    tablePublicId: string,
    sessionToken: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const menuPublicIds = createOrderDto.orderItems.map(
      (item) => item.menuPublicId,
    );
    const menus = await this.prismaService.menu.findMany({
      where: { publicId: { in: menuPublicIds } },
      select: { publicId: true, name: true, price: true },
    });
    const menuMap = new Map(menus.map((menu) => [menu.publicId, menu]));

    // 존재하지 않는 메뉴가 있는지 한 번에 체크
    if (menus.length !== menuPublicIds.length) {
      const foundIds = new Set(menus.map((m) => m.publicId));
      const missingIds = menuPublicIds.filter((id) => !foundIds.has(id));
      throw new Error(`Menus not found: ${missingIds.join(', ')}`);
    }

    const createdOrderItems = createOrderDto.orderItems.map((item) => {
      const menu = menuMap.get(item.menuPublicId);

      if (!menu) {
        throw new Error(`Menu with publicId ${item.menuPublicId} not found`);
      }

      return {
        menu: { connect: { publicId: item.menuPublicId } },
        menuName: menu.name,
        price: menu.price,
        quantity: item.quantity,
      };
    });

    return await this.prismaService.order.create({
      data: {
        store: { connect: { publicId: storePublicId } },
        table: { connect: { publicId: tablePublicId } },
        tableSession: { connect: { sessionToken } },
        orderItems: { create: createdOrderItems },
      },
      include: {
        orderItems: { include: { menu: true } },
      },
    });
  }

  async retrieveOrderList(
    storePublicId: string,
    tablePublicId: string,
  ): Promise<Order[]> {
    return await this.prismaService.order.findMany({
      where: {
        store: { publicId: storePublicId },
        table: { publicId: tablePublicId },
      },
      include: { orderItems: { include: { menu: true } } },
      orderBy: { orderedAt: 'desc' },
    });
  }

  async find(sessionToken: string): Promise<any> {
    // 1. 세션 찾기
    const session =
      await this.tableSessionService.retrieveTableSessionBySessionToken(
        sessionToken,
      );

    if (!session) {
      throw new Error('Session not found');
    }

    // 2. 해당 세션의 모든 주문 조회
    return await this.prismaService.order.findMany({
      where: {
        tableSessionId: session.id,
      },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: {
        orderedAt: 'desc',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  // async update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return await `This action updates a #${id} order`;
  // }

  // async remove(id: number) {
  //   return await `This action removes a #${id} order`;
  // }
}

import { Injectable } from '@nestjs/common';
import {
  type PublicStoreWithTablesAndOrders,
  type Owner,
  TableSessionStatus,
} from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrdersListByOwnerId(
    client: Owner,
  ): Promise<PublicStoreWithTablesAndOrders> {
    return await this.prismaService.store.findFirstOrThrow({
      where: { ownerId: client.id },
      orderBy: { createdAt: 'asc' },
      omit: {
        id: true,
        ownerId: true,
      },
      include: {
        tables: {
          omit: {
            id: true,
            storeId: true,
          },
          include: {
            tableSessions: {
              where: {
                status: {
                  in: [
                    TableSessionStatus.ACTIVE,
                    TableSessionStatus.WAITING_ORDER,
                  ],
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              omit: {
                id: true,
                tableId: true,
              },
              include: {
                orders: {
                  omit: {
                    id: true,
                    storeId: true,
                    tableId: true,
                    tableSessionId: true,
                  },
                  include: {
                    orderItems: {
                      omit: {
                        id: true,
                        orderId: true,
                        menuId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ResponseStoreWithTables, type Owner } from '@spaceorder/db';
import { TABLE_FILTER_RECORD } from 'src/table/table-query.const';
import {} from 'src/table-session/table-session-query.const';

@Injectable()
export class StoreService {
  constructor(private readonly prismaService: PrismaService) {}
  storeOmit = { id: true, ownerId: true } as const;

  async getStoreList<T extends Prisma.StoreFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.StoreFindManyArgs>,
  ): Promise<Prisma.StoreGetPayload<T>[]> {
    return await this.prismaService.store.findMany(args);
  }

  async getStoreUnique<T extends Prisma.StoreFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.StoreFindFirstOrThrowArgs>,
  ): Promise<Prisma.StoreGetPayload<T>> {
    return await this.prismaService.store.findFirstOrThrow(args);
  }

  async getOrderSummary(client: Owner): Promise<ResponseStoreWithTables> {
    return await this.prismaService.store.findFirstOrThrow({
      where: { ownerId: client.id },
      orderBy: { createdAt: 'asc' },
      include: {
        tables: {
          omit: { id: true, storeId: true },
          include: {
            tableSessions: {
              ...TABLE_FILTER_RECORD['alive-session'](),
              select: {
                publicId: true,
                expiresAt: true,
                orders: {
                  select: {
                    publicId: true,
                    status: true,
                    orderItems: {
                      select: {
                        publicId: true,
                        menuName: true,
                        quantity: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      omit: this.storeOmit,
    });
  }
}

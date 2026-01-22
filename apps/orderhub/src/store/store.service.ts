import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Prisma,
  ResponseStoreWithTables,
  SESSION_QUERY_FILTER_CONST,
  SESSION_QUERY_INCLUDE_CONST,
  type Owner,
} from '@spaceorder/db';
import { TABLE_FILTER_RECORD } from 'src/table/table-query.const';
import { SESSION_INCLUDE_KEY_RECORD } from 'src/table-session/table-session-query.const';

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

  async getStoreWithOrderList(client: Owner): Promise<ResponseStoreWithTables> {
    return await this.prismaService.store.findFirstOrThrow({
      where: { ownerId: client.id },
      orderBy: { createdAt: 'asc' },
      include: {
        tables: {
          omit: { id: true, storeId: true },
          include: {
            tableSessions: {
              ...TABLE_FILTER_RECORD[
                SESSION_QUERY_FILTER_CONST.ALIVE_SESSION
              ](),
              include:
                SESSION_INCLUDE_KEY_RECORD[
                  SESSION_QUERY_INCLUDE_CONST.ORDER_ITEMS
                ]['tableSessions']['include'],
            },
          },
        },
      },
      omit: this.storeOmit,
    });
  }
}

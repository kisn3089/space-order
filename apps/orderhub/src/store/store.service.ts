import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Prisma,
  ResponseStoreWithTables,
  TABLE_QUERY_FILTER_CONST,
  TABLE_QUERY_INCLUDE_CONST,
  type Owner,
} from '@spaceorder/db';
import {
  TABLE_INCLUDE_KEY_RECORD,
  TABLE_SESSION_FILTER_RECORD,
} from 'src/table/table-query.const';

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
              ...TABLE_SESSION_FILTER_RECORD[
                TABLE_QUERY_FILTER_CONST.ALIVE_SESSION
              ](),
              include:
                TABLE_INCLUDE_KEY_RECORD[TABLE_QUERY_INCLUDE_CONST.ORDER_ITEMS][
                  'tableSessions'
                ]['include'],
            },
          },
        },
      },
      omit: this.storeOmit,
    });
  }
}

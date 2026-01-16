import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ResponseStoreWithTables,
  TABLE_QUERY_FILTER_CONST,
  TABLE_QUERY_INCLUDE_CONST,
  type Owner,
  type Store,
} from '@spaceorder/db';
import {
  TABLE_INCLUDE_KEY_RECORD,
  TABLE_SESSION_FILTER_RECORD,
} from 'src/table/table-query.const';

@Injectable()
export class StoreService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly storeOmit = { id: true, ownerId: true };

  async getStoreList(client: Owner): Promise<Store[]> {
    return await this.prismaService.store.findMany({
      where: { ownerId: client.id },
      omit: this.storeOmit,
    });
  }

  /** 데코레이터 검증을 위해 full field가 필요하다. Omit 하지 않음 */
  async getStoreById(storePublicId: string): Promise<Store> {
    return await this.prismaService.store.findFirstOrThrow({
      where: { publicId: storePublicId },
    });
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

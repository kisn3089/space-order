import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@spaceorder/db';

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
}

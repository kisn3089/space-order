import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Owner, Store } from '@spaceorder/db';

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
}

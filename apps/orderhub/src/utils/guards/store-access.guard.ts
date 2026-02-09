import { Injectable } from '@nestjs/common';
import { TokenPayload, User } from '@spaceorder/db';
import { AccessGuard } from './access.guard';

@Injectable()
export class StoreAccessGuard extends AccessGuard {
  protected async proofCanAccess(
    user: { info: User; jwt: TokenPayload },
    params: Record<string, string>,
  ): Promise<boolean> {
    const ownerId = user.info.id;
    const storeId = params.storeId;

    const store = await this.prisma.store.findFirst({
      where: { publicId: storeId, ownerId },
    });

    return !!store;
  }
}

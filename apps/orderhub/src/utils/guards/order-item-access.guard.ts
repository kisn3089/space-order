import { Injectable } from '@nestjs/common';
import { TokenPayload, User } from '@spaceorder/db';
import { AccessGuard } from './access.guard';

@Injectable()
export class OrderItemAccessGuard extends AccessGuard {
  protected async proofCanAccess(
    user: { info: User; jwt: TokenPayload },
    params: Record<string, string>,
  ): Promise<boolean> {
    const ownerId = user.info.id;
    const orderItemId = params.orderItemId;

    const orderItem = await this.prisma.orderItem.findFirst({
      where: { publicId: orderItemId, order: { store: { ownerId } } },
    });

    return !!orderItem;
  }
}

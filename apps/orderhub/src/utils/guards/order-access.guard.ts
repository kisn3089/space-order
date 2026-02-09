import { Injectable } from '@nestjs/common';
import { TokenPayload, User } from '@spaceorder/db';
import { AccessGuard } from './access.guard';

@Injectable()
export class OrderAccessGuard extends AccessGuard {
  protected async proofCanAccess(
    user: { info: User; jwt: TokenPayload },
    params: Record<string, string>,
  ): Promise<boolean> {
    const ownerId = user.info.id;
    const orderId = params.orderId;

    const order = await this.prisma.order.findFirst({
      where: { publicId: orderId, store: { ownerId } },
    });

    return !!order;
  }
}

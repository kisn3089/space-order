import { Injectable } from "@nestjs/common";
import { PrivateRequestUser } from "@spaceorder/db";
import { AccessGuard } from "./access.guard";

@Injectable()
export class OrderItemAccessGuard extends AccessGuard {
  protected async proofCanAccess(
    user: PrivateRequestUser,
    params: Record<string, string>
  ): Promise<boolean> {
    const ownerId = user.info.id;
    const orderItemId = params.orderItemId;

    const orderItem = await this.prisma.orderItem.findFirst({
      where: { publicId: orderItemId, order: { store: { ownerId } } },
    });

    return !!orderItem;
  }
}

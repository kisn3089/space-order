import { Injectable } from '@nestjs/common';
import { TokenPayload, User } from '@spaceorder/db';
import { AccessGuard } from './access.guard';

@Injectable()
export class TableAccessGuard extends AccessGuard {
  protected async proofCanAccess(
    user: { info: User; jwt: TokenPayload },
    params: Record<string, string>,
  ): Promise<boolean> {
    const ownerId = user.info.id;
    const tableId = params.tableId;

    const table = await this.prisma.table.findFirst({
      where: { publicId: tableId, store: { ownerId } },
    });

    return !!table;
  }
}

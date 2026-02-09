import { Injectable } from '@nestjs/common';
import { PrivateRequestUser } from '@spaceorder/db';
import { AccessGuard } from './access.guard';

@Injectable()
export class AdminAccessGuard extends AccessGuard {
  protected proofCanAccess(
    user: PrivateRequestUser,
    params: Record<string, string>,
  ): boolean {
    const userId = user.info.publicId;
    const adminIdByParam = params.adminId;

    return userId === adminIdByParam && user.jwt.role === 'admin';
  }
}

/** TODO: 추후 Admin Super Guard, Viewer Guard 등 추가 구현 */

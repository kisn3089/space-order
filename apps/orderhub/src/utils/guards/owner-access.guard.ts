import { Injectable } from "@nestjs/common";
import { PrivateRequestUser } from "@spaceorder/db";
import { AccessGuard } from "./access.guard";

@Injectable()
export class OwnerAccessGuard extends AccessGuard {
  protected proofCanAccess(
    user: PrivateRequestUser,
    params: Record<string, string>
  ): boolean {
    const userId = user.info.publicId;
    const ownerIdByParam = params.ownerId;

    return userId === ownerIdByParam;
  }
}

import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { IncludingIdTableSession } from '../table-session-auth.guard';

type RequestWithTableSession = Request & {
  tableSession: IncludingIdTableSession;
};

@Injectable()
export class SessionPermission implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithTableSession>();
    const tableSession = request.tableSession;
    const { tableId } = request.params;

    if (tableSession.table.publicId === tableId) {
      return true;
    }

    throw new ForbiddenException(exceptionContentsIs('FORBIDDEN'));
  }
}

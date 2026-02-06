import { HttpStatus, HttpException } from '@nestjs/common';
import { TableSession } from '@spaceorder/db';
import { SessionWithTable } from '@spaceorder/db/types/privateModel.type';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

export function isActivateTableOrThrow(
  activatedSession: SessionWithTable,
): void {
  if (!activatedSession.table.isActive) {
    throw new HttpException(
      exceptionContentsIs('TABLE_INACTIVE'),
      HttpStatus.FORBIDDEN,
    );
  }
}

export function isSessionExpired(session: TableSession): boolean {
  return session.expiresAt < new Date();
}

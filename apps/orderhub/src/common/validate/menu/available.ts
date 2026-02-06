import { HttpException, HttpStatus } from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

export function validateMenuAvailableOrThrow(available: boolean): void {
  if (!available) {
    throw new HttpException(
      exceptionContentsIs('MENU_NOT_AVAILABLE'),
      HttpStatus.BAD_REQUEST,
    );
  }
}

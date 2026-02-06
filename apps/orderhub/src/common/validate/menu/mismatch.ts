import { HttpException, HttpStatus } from '@nestjs/common';
import { exceptionContentsIs } from '../../constants/exceptionContents';
import { Menu } from '@spaceorder/db';

export type MenuValidationFields = Pick<
  Menu,
  | 'publicId'
  | 'name'
  | 'price'
  | 'requiredOptions'
  | 'customOptions'
  | 'isAvailable'
>;

export function validateMenuMismatch(
  findMenuList: MenuValidationFields[],
  menuPublicIds: string[],
): void {
  const extractedIds = new Set(findMenuList.map((m) => m.publicId));
  const missingIds = menuPublicIds.filter((id) => !extractedIds.has(id));
  throw new HttpException(
    {
      ...exceptionContentsIs('MENU_MISMATCH'),
      details: { missingMenuIds: missingIds },
    },
    HttpStatus.BAD_REQUEST,
  );
}

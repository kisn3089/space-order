import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateOwnerDto } from './create-owner.dto';

// [TODO:] 테스트 필요
export class UpdateOwnerDto extends PartialType(
  OmitType(CreateOwnerDto, ['password', 'email'] as const),
) {}

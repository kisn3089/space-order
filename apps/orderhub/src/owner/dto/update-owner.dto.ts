import { OmitType, PartialType } from '@nestjs/mapped-types';
import { OwnerResponseDto } from './response.dto';

// [TODO:] 테스트 필요
export class UpdateOwnerDto extends PartialType(
  OmitType(OwnerResponseDto, ['password', 'email'] as const),
) {}

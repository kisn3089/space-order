import type { Owner } from '@spaceorder/db';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class OwnerResponseDto {
  @ApiProperty({ description: '사용자 고유 ID' })
  @Expose()
  publicId: string;

  @ApiProperty({ description: '이메일' })
  @Expose()
  email: string;

  @ApiProperty({ description: '이름' })
  @Expose()
  name: string;

  @ApiProperty({ description: '전화번호' })
  @Expose()
  phone: string;

  @ApiProperty({ description: '사업자 번호' })
  @Expose()
  businessNumber: string;

  @ApiProperty({ description: '활성화 여부' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: '마지막 로그인 시간', nullable: true })
  @Expose()
  lastLoginAt: Date | null;

  @ApiProperty({ description: '생성일' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @Expose()
  updatedAt: Date;

  @Exclude()
  id: bigint;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  constructor(partial: Partial<Owner>) {
    Object.assign(this, partial);
  }
}

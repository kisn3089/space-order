import { ApiProperty } from '@nestjs/swagger';
import type { Store } from '@spaceorder/db';
import { Exclude, Expose } from 'class-transformer';

export class PublicStoreDto {
  @ApiProperty({ description: '매장 고유 ID' })
  @Expose()
  publicId: string;

  @ApiProperty({ description: '매장명' })
  @Expose()
  name: string;

  @ApiProperty({ description: '매장 전화번호', nullable: true })
  @Expose()
  phone: string | null;

  @ApiProperty({ description: '매장 주소' })
  @Expose()
  address: string;

  @ApiProperty({ description: '매장 상세 주소', nullable: true })
  @Expose()
  addressDetail: string | null;

  @ApiProperty({ description: '영업 시간', nullable: true })
  @Expose()
  businessHours: string | null;

  @ApiProperty({ description: '매장 설명', nullable: true })
  @Expose()
  description: string | null;

  @ApiProperty({ description: '영업 중 여부' })
  @Expose()
  isOpen: boolean;

  @ApiProperty({ description: '주문 접수 메시지', nullable: true })
  @Expose()
  acceptedMessage: string | null;

  @ApiProperty({ description: '생성일' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @Expose()
  updatedAt: Date;

  @Exclude()
  id: bigint;

  @Exclude()
  ownerId: bigint;

  constructor(partial: Partial<Store>) {
    Object.assign(this, partial);
  }
}

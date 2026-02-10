import type { TableSession, TableSessionStatus } from '@spaceorder/db';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class TableSessionDto {
  @ApiProperty({ description: '세션 고유 ID' })
  @Expose()
  publicId: string;

  @ApiProperty({ description: '세션 상태' })
  @Expose()
  status: TableSessionStatus;

  @ApiProperty({ description: '세션 토큰' })
  @Expose()
  sessionToken: string;

  @ApiProperty({ description: '활성화 시간' })
  @Expose()
  activatedAt: Date;

  @ApiProperty({ description: '만료 시간' })
  @Expose()
  expiresAt: Date;

  @ApiProperty({ description: '결제 금액' })
  @Expose()
  paidAmount: number;

  @ApiProperty({ description: '생성일' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '종료 시간', nullable: true })
  @Expose()
  closedAt: Date | null;

  @Exclude()
  id: bigint;

  @Exclude()
  storeId: bigint;

  @Exclude()
  tableId: bigint;

  constructor(partial: Partial<TableSession>) {
    Object.assign(this, partial);
  }
}

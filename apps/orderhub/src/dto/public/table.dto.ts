import type { SummarizedTableWithSessions, Table } from '@spaceorder/db';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { PublicStoreDto } from './store.dto';
import { PublicOrderWithItemsDto } from './order.dto';
import { TableSessionDto } from './table-session-base.dto';
import { SummarizedTableSessionDto } from './session.dto';

export class TableDto {
  @ApiProperty({ description: '테이블 고유 ID' })
  @Expose()
  publicId: string;

  @ApiProperty({ description: '테이블 번호' })
  @Expose()
  tableNumber: number;

  @ApiProperty({ description: '테이블 이름' })
  @Expose()
  name: string;

  @ApiProperty({ description: '좌석 수' })
  @Expose()
  seats: number;

  @ApiProperty({ description: '층' })
  @Expose()
  floor: number;

  @ApiProperty({ description: '구역' })
  @Expose()
  section: string;

  @ApiProperty({ description: '활성화 여부' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'QR 코드' })
  @Expose()
  qrCode: string;

  @ApiProperty({ description: '설명' })
  @Expose()
  description: string;

  @ApiProperty({ description: '생성일' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: '매장 정보', required: false })
  @Expose()
  store?: PublicStoreDto;

  @Exclude()
  id: bigint;

  @Exclude()
  storeId: bigint;

  constructor(partial: Partial<Table>) {
    Object.assign(this, partial);
  }
}

export class PublicTableDto extends TableDto {
  @ApiProperty({
    description: '주문 목록',
    required: false,
    type: [PublicOrderWithItemsDto],
  })
  @Expose()
  @Type(() => PublicOrderWithItemsDto)
  orders?: PublicOrderWithItemsDto[];

  @ApiProperty({
    description: '테이블 세션 목록',
    required: false,
    type: [TableSessionDto],
  })
  @Expose()
  @Type(() => TableSessionDto)
  tableSessions?: TableSessionDto[];

  constructor(partial: Partial<Table>) {
    super(partial);
  }
}

/** 테이블 요약 DTO (세션 포함) */
export class SummarizedTableDto {
  @ApiProperty({ description: '테이블 고유 ID' })
  @Expose()
  publicId: string;

  @ApiProperty({ description: '테이블 번호' })
  @Expose()
  tableNumber: number;

  @ApiProperty({ description: '테이블 이름' })
  @Expose()
  name: string;

  @ApiProperty({ description: '좌석 수' })
  @Expose()
  seats: number;

  @ApiProperty({ description: '층', nullable: true })
  @Expose()
  floor: number | null;

  @ApiProperty({ description: '구역', nullable: true })
  @Expose()
  section: string | null;

  @ApiProperty({ description: '활성화 여부' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'QR 코드' })
  @Expose()
  qrCode: string;

  @ApiProperty({ description: '설명', nullable: true })
  @Expose()
  description: string | null;

  @ApiProperty({ description: '생성일' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: '테이블 세션 목록',
    type: [SummarizedTableSessionDto],
    required: false,
  })
  @Expose()
  @Type(() => SummarizedTableSessionDto)
  tableSessions?: SummarizedTableSessionDto[];

  constructor(partial: Partial<SummarizedTableWithSessions>) {
    Object.assign(this, partial);
  }
}

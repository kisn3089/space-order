import type {
  TableWithStoreContext,
  TableSession,
  TableSessionStatus,
} from '@spaceorder/db';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { TableDto, PublicTableDto } from './table.dto';
import { PublicStoreDto } from './store.dto';
import { PublicMenuDto } from './menu.dto';
import { TableSessionDto } from './table-session-base.dto';
import { SummarizedOrderDto } from './order.dto';

export class PublicTableSessionDto extends TableSessionDto {
  @Exclude()
  table: PublicTableDto[];

  constructor(partial: Partial<TableSession>) {
    super(partial);
  }
}

export class SessionTokenDto {
  @ApiProperty({ description: '세션 토큰' })
  @Expose()
  sessionToken: string;

  constructor(partial: Partial<TableSession>) {
    Object.assign(this, partial);
  }
}

/** 테이블 세션 요약 DTO (주문 포함) */
export class SummarizedTableSessionDto {
  @ApiProperty({ description: '세션 고유 ID' })
  @Expose()
  publicId: string;

  @ApiProperty({ description: '세션 만료 시간' })
  @Expose()
  expiresAt: Date;

  @ApiProperty({
    description: '주문 목록',
    type: [SummarizedOrderDto],
  })
  @Expose()
  @Type(() => SummarizedOrderDto)
  orders: SummarizedOrderDto[];
}

class StoreWithMenusDto extends PublicStoreDto {
  @Expose()
  @Type(() => PublicMenuDto)
  menus: PublicMenuDto[];

  constructor(partial: Partial<PublicStoreDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

class TableWithStoreMenusDto extends TableDto {
  @Expose()
  @Type(() => StoreWithMenusDto)
  declare store: StoreWithMenusDto;

  constructor(partial: Partial<PublicTableDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class TableWithStoreContextDto {
  @Expose()
  @Type(() => TableWithStoreMenusDto)
  table: TableWithStoreMenusDto;

  @Exclude()
  publicId: string;

  @Exclude()
  status: TableSessionStatus;

  @Exclude()
  sessionToken: string;

  @Exclude()
  activatedAt: Date;

  @Exclude()
  expiresAt: Date;

  @Exclude()
  paidAmount: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  closedAt: Date | null;

  @Exclude()
  id: bigint;

  @Exclude()
  storeId: bigint;

  @Exclude()
  tableId: bigint;

  constructor(
    partial: Partial<TableSession & { table: TableWithStoreContext }>,
  ) {
    Object.assign(this, partial);
  }
}

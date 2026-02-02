import { ApiProperty } from '@nestjs/swagger';
import type {
  OrderStatus,
  Store,
  SummarizedOrdersFromStore,
  SummarizedTableWithSessions,
} from '@spaceorder/db';
import { Exclude, Expose, Type } from 'class-transformer';

export class StoreResponseDto {
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

/** 주문 항목 요약 DTO */
export class SummarizedOrderItemDto {
  @ApiProperty({ description: '주문 항목 고유 ID' })
  @Expose()
  publicId: string;

  @ApiProperty({ description: '메뉴 이름' })
  @Expose()
  menuName: string;

  @ApiProperty({ description: '수량' })
  @Expose()
  quantity: number;
}

/** 주문 요약 DTO (항목 포함) */
export class SummarizedOrderDto {
  @ApiProperty({ description: '주문 고유 ID' })
  @Expose()
  publicId: string;

  @ApiProperty({ description: '주문 상태' })
  @Expose()
  status: OrderStatus;

  @ApiProperty({
    description: '주문 항목 목록',
    type: [SummarizedOrderItemDto],
  })
  @Expose()
  @Type(() => SummarizedOrderItemDto)
  orderItems: SummarizedOrderItemDto[];
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

/** 매장 주문 요약 DTO */
export class SummarizedOrdersResponseDto extends StoreResponseDto {
  @ApiProperty({
    description: '테이블별 주문 요약 정보',
    type: [SummarizedTableDto],
  })
  @Expose()
  @Type(() => SummarizedTableDto)
  tables: SummarizedTableDto[];

  constructor(partial: Partial<SummarizedOrdersFromStore>) {
    super(partial);
    this.tables = partial.tables?.map((t) => new SummarizedTableDto(t)) ?? [];
  }
}

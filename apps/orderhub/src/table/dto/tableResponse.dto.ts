import type { Table } from '@spaceorder/db';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { StoreResponseDto } from 'src/store/dto/storeResponse.dto';
import { TableSessionResponseDto } from 'src/table-session/dto/tableSessionResponse.dto';
import { OrderWithItemsResponseDto } from 'src/order/dto/orderResponse.dto';

class TableDto {
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
  store?: StoreResponseDto;

  @Exclude()
  id: bigint;

  @Exclude()
  storeId: bigint;

  constructor(partial: Partial<Table>) {
    Object.assign(this, partial);
  }
}

export class TableResponseDto extends TableDto {
  @ApiProperty({
    description: '주문 목록',
    required: false,
    type: [OrderWithItemsResponseDto],
  })
  @Expose()
  @Type(() => OrderWithItemsResponseDto)
  orders?: OrderWithItemsResponseDto[];

  @ApiProperty({
    description: '테이블 세션 목록',
    required: false,
    type: [TableSessionResponseDto],
  })
  @Expose()
  @Type(() => TableSessionResponseDto)
  tableSessions?: TableSessionResponseDto[];

  constructor(partial: Partial<Table>) {
    super(partial);
  }
}

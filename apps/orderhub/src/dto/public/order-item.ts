import type { OrderItem } from "@spaceorder/db";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export class PublicOrderItemDto {
  @ApiProperty({ description: "주문 항목 고유 ID" })
  @Expose()
  publicId: string;

  @ApiProperty({ description: "메뉴 이름" })
  @Expose()
  menuName: string;

  @ApiProperty({ description: "기본 가격" })
  @Expose()
  basePrice: number;

  @ApiProperty({ description: "옵션 가격" })
  @Expose()
  optionsPrice: number;

  @ApiProperty({ description: "단가 (기본 가격 + 옵션 가격)" })
  @Expose()
  unitPrice: number;

  @ApiProperty({ description: "수량" })
  @Expose()
  quantity: number;

  @ApiProperty({
    description: "선택한 옵션 스냅샷",
    type: Object,
    nullable: true,
  })
  @Expose()
  optionsSnapshot: object | null;

  @ApiProperty({ description: "생성일" })
  @Expose()
  createdAt: Date;

  @Exclude()
  id: bigint;

  @Exclude()
  orderId: bigint;

  @Exclude()
  menuId: bigint;

  constructor(partial: Partial<OrderItem>) {
    Object.assign(this, partial);
  }
}

/** 주문 항목 요약 DTO */
export class SummarizedOrderItemDto {
  @ApiProperty({ description: "주문 항목 고유 ID" })
  @Expose()
  publicId: string;

  @ApiProperty({ description: "메뉴 이름" })
  @Expose()
  menuName: string;

  @ApiProperty({ description: "수량" })
  @Expose()
  quantity: number;
}

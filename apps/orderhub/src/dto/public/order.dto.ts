import type { Order, OrderItem, OrderStatus } from "@spaceorder/db";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { PublicOrderItemDto, SummarizedOrderItemDto } from "./order-item";

/** 주문 응답 DTO */
export class PublicOrderDto {
  @ApiProperty({ description: "주문 고유 ID" })
  @Expose()
  publicId: string;

  @ApiProperty({ description: "주문 상태" })
  @Expose()
  status: OrderStatus;

  @ApiProperty({ description: "메모", nullable: true })
  @Expose()
  memo: string | null;

  @ApiProperty({ description: "취소 사유", nullable: true })
  @Expose()
  cancelledReason: string | null;

  @ApiProperty({ description: "접수 시간", nullable: true })
  @Expose()
  acceptedAt: Date | null;

  @ApiProperty({ description: "완료 시간", nullable: true })
  @Expose()
  completedAt: Date | null;

  @ApiProperty({ description: "생성일" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "수정일" })
  @Expose()
  updatedAt: Date;

  @Exclude()
  id: bigint;

  @Exclude()
  storeId: bigint;

  @Exclude()
  tableId: bigint;

  @Exclude()
  tableSessionId: bigint;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }
}

/** 주문 요약 DTO (항목 포함) */
export class SummarizedOrderDto {
  @ApiProperty({ description: "주문 고유 ID" })
  @Expose()
  publicId: string;

  @ApiProperty({ description: "주문 상태" })
  @Expose()
  status: OrderStatus;

  @ApiProperty({
    description: "주문 항목 목록",
    type: [SummarizedOrderItemDto],
  })
  @Expose()
  @Type(() => SummarizedOrderItemDto)
  orderItems: SummarizedOrderItemDto[];
}

/** 주문 + 주문 항목 응답 DTO */
export class PublicOrderWithItemsDto extends PublicOrderDto {
  @ApiProperty({
    description: "주문 항목 목록",
    type: [PublicOrderItemDto],
  })
  @Expose()
  @Type(() => PublicOrderItemDto)
  orderItems: PublicOrderItemDto[];

  constructor(partial: Partial<Order & { orderItems: OrderItem[] }>) {
    super(partial);
    this.orderItems =
      partial.orderItems?.map((item) => new PublicOrderItemDto(item)) ?? [];
  }
}

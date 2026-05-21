import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { SummarizedOrderDto } from "./order.dto";

/** 테이블 세션 요약 DTO (주문 포함) */
export class SummarizedTableSessionDto {
  @ApiProperty({ description: "세션 고유 ID" })
  @Expose()
  publicId: string;

  @ApiProperty({ description: "세션 만료 시간" })
  @Expose()
  expiresAt: Date;

  @ApiProperty({
    description: "주문 목록",
    type: [SummarizedOrderDto],
  })
  @Expose()
  @Type(() => SummarizedOrderDto)
  orders: SummarizedOrderDto[];
}

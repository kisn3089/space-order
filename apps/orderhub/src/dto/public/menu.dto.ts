import type { Menu, OrderItem, Store } from "@spaceorder/db";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export class PublicMenuDto {
  @ApiProperty({ description: "메뉴 고유 ID" })
  @Expose()
  publicId: string;

  @ApiProperty({ description: "메뉴 이름" })
  @Expose()
  name: string;

  @ApiProperty({ description: "가격" })
  @Expose()
  price: number;

  @ApiProperty({ description: "메뉴 설명", nullable: true })
  @Expose()
  description: string;

  @ApiProperty({ description: "이미지 URL", nullable: true })
  @Expose()
  imageUrl: string;

  @ApiProperty({ description: "판매 가능 여부" })
  @Expose()
  isAvailable: boolean;

  @ApiProperty({ description: "카테고리" })
  @Expose()
  category: string;

  @ApiProperty({ description: "정렬 순서" })
  @Expose()
  sortOrder: number;

  @ApiProperty({ description: "필수 옵션", type: Object })
  @Expose()
  requiredOptions: object;

  @ApiProperty({ description: "선택 옵션", type: Object })
  @Expose()
  customOptions: object;

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
  store: Store;

  @Exclude()
  orderItems: OrderItem[];

  constructor(partial: Partial<Menu>) {
    Object.assign(this, partial);
  }
}

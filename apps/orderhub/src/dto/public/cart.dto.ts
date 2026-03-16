import { ApiProperty } from "@nestjs/swagger";

export class PublicCartItemDto {
  @ApiProperty({ description: "장바구니 항목 고유 ID" })
  id: string;

  @ApiProperty({ description: "메뉴 고유 ID" })
  menuPublicId: string;

  @ApiProperty({ description: "메뉴 이름" })
  menuName: string;

  @ApiProperty({ description: "기본 가격" })
  basePrice: number;

  @ApiProperty({ description: "옵션 가격" })
  optionsPrice: number;

  @ApiProperty({ description: "단가 (기본 가격 + 옵션 가격)" })
  unitPrice: number;

  @ApiProperty({ description: "수량" })
  quantity: number;

  @ApiProperty({
    description: "필수 옵션 선택값",
    type: Object,
    nullable: true,
  })
  requiredOptions: Record<string, string> | null;

  @ApiProperty({
    description: "커스텀 옵션 선택값",
    type: Object,
    nullable: true,
  })
  customOptions: Record<string, string> | null;

  @ApiProperty({ description: "장바구니 추가 시간 (ISO 8601)" })
  addedAt: string;
}

export class CartDataDto {
  @ApiProperty({ description: "세션 토큰" })
  sessionToken: string;

  @ApiProperty({ description: "장바구니 항목 목록", type: [PublicCartItemDto] })
  items: PublicCartItemDto[];

  @ApiProperty({ description: "마지막 수정 시간 (ISO 8601)" })
  updatedAt: string;
}

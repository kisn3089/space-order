import { ApiProperty } from "@nestjs/swagger";

export class PublicCartItemDto {
  @ApiProperty({ description: "장바구니 항목 고유 ID" })
  id: string;

  @ApiProperty({ description: "메뉴 고유 ID" })
  menuPublicId: string;

  @ApiProperty({ description: "메뉴 이름" })
  menuName: string;

  @ApiProperty({ description: "메뉴 이미지 URL", nullable: true })
  menuImageUrl: string | null;

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
    required: false,
  })
  requiredOptions?: Record<string, string>;

  @ApiProperty({
    description: "커스텀 옵션 선택값",
    type: Object,
    required: false,
  })
  customOptions?: Record<string, string>;

  @ApiProperty({ description: "장바구니 추가 시간 (ISO 8601)" })
  addedAt: string;

  @ApiProperty({ description: "옵션 조합 식별 지문 (동일 옵션 합산 기준)" })
  fingerprint: string;
}

export class CartDataDto {
  @ApiProperty({ description: "세션 토큰" })
  sessionToken: string;

  @ApiProperty({ description: "장바구니 항목 목록", type: [PublicCartItemDto] })
  menus: PublicCartItemDto[];

  @ApiProperty({ description: "마지막 수정 시간 (ISO 8601)" })
  updatedAt: string;
}

export class SyncNoticeMessageDto {
  @ApiProperty({ description: "점주용 안내 메시지", required: false })
  owner?: string;

  @ApiProperty({ description: "고객용 안내 메시지", required: false })
  customer?: string;
}

export class SyncNoticeDto {
  @ApiProperty({
    description: "안내 레벨",
    enum: ["info", "success", "error"],
  })
  level: "info" | "success" | "error";

  @ApiProperty({
    description: "대상별 안내 메시지",
    type: SyncNoticeMessageDto,
  })
  message: SyncNoticeMessageDto;

  @ApiProperty({ description: "알림음 재생 여부", required: false })
  sound?: boolean;
}

export class CartWithNoticeDto {
  @ApiProperty({ description: "장바구니 데이터", type: CartDataDto })
  cart: CartDataDto;

  @ApiProperty({ description: "장바구니 변경 안내", type: SyncNoticeDto })
  notice: SyncNoticeDto;
}

export class CartWithOptionalNoticeDto {
  @ApiProperty({ description: "장바구니 데이터", type: CartDataDto })
  cart: CartDataDto;

  @ApiProperty({
    description: "장바구니 변경 안내 (변경이 없으면 생략)",
    type: SyncNoticeDto,
    required: false,
  })
  notice?: SyncNoticeDto;
}

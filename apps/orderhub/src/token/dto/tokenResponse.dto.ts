import { ApiProperty } from '@nestjs/swagger';
import { ResponseAccessToken } from '@spaceorder/api';

export class AccessTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken: string;

  @ApiProperty({ description: '토큰 만료 시간' })
  expiresAt: Date;

  constructor(partial: Partial<ResponseAccessToken>) {
    Object.assign(this, partial);
  }
}

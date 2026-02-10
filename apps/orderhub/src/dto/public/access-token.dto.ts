import { ApiProperty } from '@nestjs/swagger';
import { AccessToken } from '@spaceorder/api';

export class AccessTokenDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken: string;

  @ApiProperty({ description: '토큰 만료 시간' })
  expiresAt: Date;

  constructor(partial: Partial<AccessToken>) {
    Object.assign(this, partial);
  }
}

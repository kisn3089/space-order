import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../../../utils/jwt/token-payload.interface';
import { AdminService } from '../../admin/admin.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 왜 여기는 private readonly
  constructor(
    configService: ConfigService,
    private readonly adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  validate(payload: TokenPayload) {
    return this.adminService.findOne(payload.userId);
  }
}

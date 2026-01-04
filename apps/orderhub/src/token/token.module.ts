import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local-sign-in.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { OwnerModule } from '../owner/owner.module';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { GenerateToken } from 'src/utils/jwt/token-config';

@Module({
  imports: [AdminModule, OwnerModule, PassportModule, JwtModule],
  controllers: [TokenController],
  providers: [
    TokenService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GenerateToken,
  ],
})
export class TokenModule {}

import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { OwnerModule } from '../owner/owner.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GenerateToken } from 'src/utils/jwt/token-config';

@Module({
  imports: [AdminModule, OwnerModule, PassportModule, JwtModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GenerateToken,
  ],
})
export class AuthModule {}

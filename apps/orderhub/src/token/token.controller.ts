import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TokenService } from './token.service';
import { tokenDocs } from 'src/docs/token.docs';
import { LocalSignInGuard } from '../utils/guards/local-sign-in.guard';
import { Client } from '../decorators/client.decorator';
import type { Owner } from '@spaceorder/db';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from 'src/utils/guards/jwt-refresh-auth.guard';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { signInFormSchema } from '@spaceorder/api/schemas';
import { AccessTokenResponseDto } from './dto/tokenResponse.dto';
import { createZodDto } from 'nestjs-zod';

class SignInFormDto extends createZodDto(signInFormSchema) {}
@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  @UseGuards(ZodValidation({ body: signInFormSchema }), LocalSignInGuard)
  @ApiOperation({ summary: tokenDocs.signIn.summary })
  @ApiBody({ type: SignInFormDto })
  @ApiResponse({
    ...tokenDocs.signIn.successResponse,
    type: AccessTokenResponseDto,
  })
  @ApiResponse(tokenDocs.unauthorizedResponse)
  async createTokenBySignIn(
    @Client() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenResponseDto> {
    return new AccessTokenResponseDto(
      await this.tokenService.createToken(owner, response),
    );
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: tokenDocs.refresh.summary })
  @ApiResponse({
    ...tokenDocs.refresh.successResponse,
    type: AccessTokenResponseDto,
  })
  @ApiResponse(tokenDocs.unauthorizedResponse)
  async createTokenByRefreshToken(
    @Client() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenResponseDto> {
    return new AccessTokenResponseDto(
      await this.tokenService.createToken(owner, response),
    );
  }
}

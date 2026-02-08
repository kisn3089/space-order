import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Client } from 'src/decorators/client.decorator';
import type { TokenPayload, User } from '@spaceorder/db';
import { meDocs } from 'src/docs/me.docs';
import { PublicOwnerDto } from 'src/dto/public/owner.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PublicAdminDto } from 'src/dto/public/admin.dto';
import { Jwt } from 'src/decorators/jwt.decorator';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

@ApiTags('Me')
@Controller('me')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: meDocs.find.summary })
  @ApiResponse({
    ...meDocs.find.successResponse,
    schema: {
      oneOf: [
        { $ref: getSchemaPath(PublicOwnerDto) },
        { $ref: getSchemaPath(PublicAdminDto) },
      ],
    },
  })
  @ApiResponse(meDocs.unauthorizedResponse)
  findMe(
    @Client() user: User,
    @Jwt() jwt: TokenPayload,
  ): PublicOwnerDto | PublicAdminDto {
    switch (jwt.role) {
      case 'owner':
        return new PublicOwnerDto(user);
      case 'admin':
        return new PublicAdminDto(user);
      default:
        throw new HttpException(
          exceptionContentsIs('INVALID_ROLE'),
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}

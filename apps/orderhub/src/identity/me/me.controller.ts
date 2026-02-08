import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Client } from 'src/decorators/client.decorator';
import type { Owner } from '@spaceorder/db';
import { meDocs } from 'src/docs/me.docs';
import { PublicOwnerDto } from 'src/dto/public/owner.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Me')
@Controller('me')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: meDocs.find.summary })
  @ApiResponse({ ...meDocs.find.successResponse, type: PublicOwnerDto })
  @ApiResponse(meDocs.unauthorizedResponse)
  findMe(@Client() owner: Owner): PublicOwnerDto {
    return new PublicOwnerDto(owner);
  }
}

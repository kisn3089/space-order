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
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Client } from 'src/decorators/client.decorator';
import type { Owner } from '@spaceorder/db';
import { OwnerResponseDto } from 'src/owner/dto/ownerResponse.dto';
import { meDocs } from 'src/docs/me.docs';

@ApiTags('Me')
@Controller('me')
@UseInterceptors(ClassSerializerInterceptor)
export class MeController {
  constructor() {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: meDocs.find.summary })
  @ApiResponse({ ...meDocs.find.successResponse, type: OwnerResponseDto })
  @ApiResponse(meDocs.unauthorizedResponse)
  find(@Client() owner: Owner): OwnerResponseDto {
    return new OwnerResponseDto(owner);
  }
}

import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Client } from 'src/decorators/client.decorator';
import type { Owner } from '@spaceorder/db';
import { OwnerResponseDto } from 'src/owner/dto/ownerResponse.dto';

@Controller('me')
@UseInterceptors(ClassSerializerInterceptor)
export class MeController {
  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  findMe(@Client() owner: Owner): OwnerResponseDto {
    return new OwnerResponseDto(owner);
  }
}

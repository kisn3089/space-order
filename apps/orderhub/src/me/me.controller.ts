import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Client } from 'src/decorators/client.decorator';
import type { Owner } from '@spaceorder/db';
import { OwnerResponseDto } from 'src/owner/dto/ownerResponse.dto';
import { MeService } from './me.service';

@Controller('me')
@UseInterceptors(ClassSerializerInterceptor)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findMe(@Client() owner: Owner): OwnerResponseDto {
    return new OwnerResponseDto(owner);
  }
}

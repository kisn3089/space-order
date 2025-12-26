import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { CurrentUser } from 'src/dacorators/current-user.decorator';
import { OwnerResponseDto } from 'src/owner/dto/response-owner.dto';
import type { Owner } from '@spaceorder/db';

@Controller('me')
@UseInterceptors(ClassSerializerInterceptor)
export class MeController {
  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  findMe(@CurrentUser() owner: Owner) {
    return new OwnerResponseDto(owner);
  }
}

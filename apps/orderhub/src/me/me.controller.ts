import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { JwtUser } from 'src/dacorators/jwtUser.decorator';
import type { Owner, PublicOwner } from '@spaceorder/db';

@Controller('me')
@UseInterceptors(ClassSerializerInterceptor)
export class MeController {
  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  findMe(@JwtUser() owner: Owner): PublicOwner {
    return owner;
  }
}

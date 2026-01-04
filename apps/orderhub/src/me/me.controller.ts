import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Client } from 'src/dacorators/client.decorator';
import type { Owner, PublicOwner } from '@spaceorder/db';

@Controller('me')
export class MeController {
  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  findMe(@Client() owner: Owner): PublicOwner {
    return owner;
  }
}

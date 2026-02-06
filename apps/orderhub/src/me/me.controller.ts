import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Client } from 'src/decorators/client.decorator';
import type { Owner } from '@spaceorder/db';
import { meDocs } from 'src/docs/me.docs';
import { PublicOwnerDto } from 'src/dto/public/owner.dto';
import { MeService } from './me.service';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { updateOwnerPayloadSchema } from '@spaceorder/api/schemas/model/owner.schema';
import { UpdateOwnerPayloadDto } from 'src/dto/owner.dto';

@ApiTags('Me')
@Controller('me')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: meDocs.find.summary })
  @ApiResponse({ ...meDocs.find.successResponse, type: PublicOwnerDto })
  @ApiResponse(meDocs.unauthorizedResponse)
  findMe(@Client() owner: Owner): PublicOwnerDto {
    return new PublicOwnerDto(owner);
  }

  @Patch()
  @UseGuards(ZodValidation({ body: updateOwnerPayloadSchema }), JwtAuthGuard)
  @ApiOperation({ summary: meDocs.update.summary })
  @ApiBody({ type: UpdateOwnerPayloadDto })
  @ApiResponse({
    ...meDocs.update.successResponse,
    type: PublicOwnerDto,
  })
  @ApiResponse(meDocs.unauthorizedResponse)
  async partialUpdate(
    @Client() owner: Owner,
    @Body() updateOwnerPayload: UpdateOwnerPayloadDto,
  ): Promise<PublicOwnerDto> {
    const updated = await this.meService.partialUpdateOwner(
      owner.publicId,
      updateOwnerPayload,
    );
    return new PublicOwnerDto(updated);
  }
}

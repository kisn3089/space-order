import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OwnerService } from './owner.service';
import {
  DocsOwnerCreate,
  DocsOwnerDelete,
  DocsOwnerGetList,
  DocsOwnerGetUnique,
  DocsOwnerUpdate,
} from 'src/docs/owner.docs';
import {
  createOwnerPayloadSchema,
  ownerIdParamsSchema,
  updateOwnerPayloadSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type { Owner, PublicOwner } from '@spaceorder/db';
import { Client } from 'src/decorators/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CreateOwnerPayloadDto,
  UpdateOwnerPayloadDto,
} from 'src/dto/owner.dto';

@ApiTags('Owner')
@ApiBearerAuth()
@Controller('owners')
@UseGuards(JwtAuthGuard)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @UseGuards(ZodValidation({ body: createOwnerPayloadSchema }))
  @DocsOwnerCreate()
  async create(
    @Body() createOwnerPayload: CreateOwnerPayloadDto,
  ): Promise<PublicOwner> {
    return await this.ownerService.createOwner(createOwnerPayload);
  }

  @Get()
  @DocsOwnerGetList()
  async list(@Client() owner: Owner): Promise<PublicOwner[]> {
    return await this.ownerService.getList({
      where: { id: owner.id },
      omit: this.ownerService.omitPrivate,
    });
  }

  @Get(':ownerId')
  @UseGuards(ZodValidation({ params: ownerIdParamsSchema }))
  @UseInterceptors(ClassSerializerInterceptor)
  @DocsOwnerGetUnique()
  async unique(@Param('ownerId') ownerId: string): Promise<PublicOwner> {
    return await this.ownerService.getUnique({
      where: { publicId: ownerId },
      omit: this.ownerService.omitPrivate,
    });
  }

  @Patch(':ownerId')
  @UseGuards(
    ZodValidation({
      params: ownerIdParamsSchema,
      body: updateOwnerPayloadSchema,
    }),
  )
  @DocsOwnerUpdate()
  async partialUpdate(
    @Param('ownerId') ownerId: string,
    @Body() updateOwnerPayloadDto: UpdateOwnerPayloadDto,
  ): Promise<PublicOwner> {
    return await this.ownerService.partialUpdateOwner(
      ownerId,
      updateOwnerPayloadDto,
    );
  }

  @Delete(':ownerId')
  @HttpCode(204)
  @UseGuards(ZodValidation({ params: ownerIdParamsSchema }))
  @DocsOwnerDelete()
  async delete(@Param('ownerId') ownerId: string): Promise<void> {
    await this.ownerService.deleteOwner(ownerId);
  }
}

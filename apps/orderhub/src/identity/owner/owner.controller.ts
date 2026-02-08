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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OwnerService } from './owner.service';
import { ownerDocs } from 'src/docs/owner.docs';
import { paramsDocs } from 'src/docs/params.docs';
import { createZodDto } from 'nestjs-zod';
import {
  createOwnerPayloadSchema,
  ownerIdParamsSchema,
  updateOwnerPayloadSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type { Owner, PublicOwner } from '@spaceorder/db';
import { PublicOwnerDto } from 'src/dto/public/owner.dto';
import { Client } from 'src/decorators/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

export class CreateOwnerDto extends createZodDto(createOwnerPayloadSchema) {}
export class UpdateOwnerDto extends createZodDto(updateOwnerPayloadSchema) {}

@ApiTags('Owners')
@ApiBearerAuth()
@Controller('identity/v1/owners')
@UseGuards(JwtAuthGuard)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @UseGuards(ZodValidation({ body: createOwnerPayloadSchema }))
  @ApiOperation({ summary: ownerDocs.create.summary })
  @ApiBody({ type: CreateOwnerDto })
  @ApiResponse({
    ...ownerDocs.create.successResponse,
    type: PublicOwnerDto,
  })
  @ApiResponse(ownerDocs.badRequestResponse)
  @ApiResponse(ownerDocs.unauthorizedResponse)
  async create(@Body() createOwnerDto: CreateOwnerDto): Promise<PublicOwner> {
    return await this.ownerService.createOwner(createOwnerDto);
  }

  @Get()
  @ApiOperation({ summary: ownerDocs.getList.summary })
  @ApiResponse({
    ...ownerDocs.getList.successResponse,
    type: [PublicOwnerDto],
  })
  @ApiResponse(ownerDocs.unauthorizedResponse)
  async list(@Client() owner: Owner): Promise<PublicOwner[]> {
    return await this.ownerService.getList({
      where: { id: owner.id },
      omit: this.ownerService.omitPrivate,
    });
  }

  @Get(':ownerId')
  @UseGuards(ZodValidation({ params: ownerIdParamsSchema }))
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: ownerDocs.getUnique.summary })
  @ApiParam(paramsDocs.ownerId)
  @ApiResponse({
    ...ownerDocs.getUnique.successResponse,
    type: PublicOwnerDto,
  })
  @ApiResponse(ownerDocs.unauthorizedResponse)
  @ApiResponse(ownerDocs.notFoundResponse)
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
  @ApiOperation({ summary: ownerDocs.update.summary })
  @ApiParam(paramsDocs.ownerId)
  @ApiBody({ type: UpdateOwnerDto })
  @ApiResponse({
    ...ownerDocs.update.successResponse,
    type: PublicOwnerDto,
  })
  @ApiResponse(ownerDocs.badRequestResponse)
  @ApiResponse(ownerDocs.unauthorizedResponse)
  @ApiResponse(ownerDocs.notFoundResponse)
  async partialUpdate(
    @Param('ownerId') ownerId: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ): Promise<PublicOwner> {
    return await this.ownerService.partialUpdateOwner(ownerId, updateOwnerDto);
  }

  @Delete(':ownerId')
  @HttpCode(204)
  @UseGuards(ZodValidation({ params: ownerIdParamsSchema }))
  @ApiOperation({ summary: ownerDocs.delete.summary })
  @ApiParam(paramsDocs.ownerId)
  @ApiResponse(ownerDocs.delete.successResponse)
  @ApiResponse(ownerDocs.unauthorizedResponse)
  @ApiResponse(ownerDocs.notFoundResponse)
  async delete(@Param('ownerId') ownerId: string): Promise<void> {
    await this.ownerService.deleteOwner(ownerId);
  }
}

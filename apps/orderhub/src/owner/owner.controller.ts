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
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import {
  createOwnerSchema,
  ownerParamsSchema,
  updateOwnerSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type { ResponseOwner } from '@spaceorder/db';
import { OwnerPermission } from 'src/utils/guards/model-permissions/owner-permission.guard';
import { OwnerResponseDto } from './dto/ownerResponse.dto';

export class CreateOwnerDto extends createZodDto(createOwnerSchema) {}
export class UpdateOwnerDto extends createZodDto(updateOwnerSchema) {}

@ApiTags('Owners')
@ApiBearerAuth()
@Controller('owners')
@UseGuards(JwtAuthGuard)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @UseGuards(ZodValidation({ body: createOwnerSchema }))
  @ApiOperation({ summary: ownerDocs.create.summary })
  @ApiBody({ type: CreateOwnerDto })
  @ApiResponse({
    ...ownerDocs.create.successResponse,
    type: OwnerResponseDto,
  })
  @ApiResponse(ownerDocs.badRequestResponse)
  @ApiResponse(ownerDocs.unauthorizedResponse)
  async create(@Body() createOwnerDto: CreateOwnerDto): Promise<ResponseOwner> {
    return await this.ownerService.createOwner(createOwnerDto);
  }

  @Get()
  @ApiOperation({ summary: ownerDocs.getList.summary })
  @ApiResponse({
    ...ownerDocs.getList.successResponse,
    type: [OwnerResponseDto],
  })
  @ApiResponse(ownerDocs.unauthorizedResponse)
  async getList(): Promise<ResponseOwner[]> {
    return await this.ownerService.getOwnerList({
      omit: this.ownerService.ownerOmit,
    });
  }

  @Get(':ownerId')
  @UseGuards(ZodValidation({ params: ownerParamsSchema }), OwnerPermission)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: ownerDocs.getUnique.summary })
  @ApiParam(paramsDocs.ownerId)
  @ApiResponse({
    ...ownerDocs.getUnique.successResponse,
    type: OwnerResponseDto,
  })
  @ApiResponse(ownerDocs.unauthorizedResponse)
  @ApiResponse(ownerDocs.notFoundResponse)
  async getUnique(
    @Param('ownerId') ownerId: string,
  ): Promise<OwnerResponseDto> {
    const findOwner = await this.ownerService.getOwnerUnique({
      where: { publicId: ownerId },
    });

    return new OwnerResponseDto(findOwner);
  }

  @Patch(':ownerId')
  @UseGuards(
    ZodValidation({
      params: ownerParamsSchema,
      body: updateOwnerSchema,
    }),
    OwnerPermission,
  )
  @ApiOperation({ summary: ownerDocs.update.summary })
  @ApiParam(paramsDocs.ownerId)
  @ApiBody({ type: UpdateOwnerDto })
  @ApiResponse({
    ...ownerDocs.update.successResponse,
    type: OwnerResponseDto,
  })
  @ApiResponse(ownerDocs.badRequestResponse)
  @ApiResponse(ownerDocs.unauthorizedResponse)
  @ApiResponse(ownerDocs.notFoundResponse)
  async partialUpdate(
    @Param('ownerId') ownerId: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ): Promise<ResponseOwner> {
    return await this.ownerService.partialUpdateOwner(ownerId, updateOwnerDto);
  }

  @Delete(':ownerId')
  @UseGuards(ZodValidation({ params: ownerParamsSchema }), OwnerPermission)
  @ApiOperation({ summary: ownerDocs.delete.summary })
  @ApiParam(paramsDocs.ownerId)
  @ApiResponse(ownerDocs.delete.successResponse)
  @ApiResponse(ownerDocs.unauthorizedResponse)
  @ApiResponse(ownerDocs.notFoundResponse)
  async delete(@Param('ownerId') ownerId: string): Promise<void> {
    await this.ownerService.deleteOwner(ownerId);
  }
}

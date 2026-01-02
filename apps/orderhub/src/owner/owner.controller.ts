import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import {
  createOwnerSchema,
  ownerParamsSchema,
  updateOwnerSchema,
} from '@spaceorder/auth';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { PublicOwner } from '@spaceorder/db';

export class CreateOwnerDto extends createZodDto(createOwnerSchema) {}
export class UpdateOwnerDto extends createZodDto(updateOwnerSchema) {}

@Controller('owners')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(ZodValidationGuard({ body: createOwnerSchema }))
  async createOwner(
    @Body() createOwnerDto: CreateOwnerDto,
  ): Promise<PublicOwner> {
    return await this.ownerService.createOwner(createOwnerDto);
  }

  @Get()
  @HttpCode(200)
  async retrieveOwnerList(): Promise<PublicOwner[]> {
    return await this.ownerService.getOwnerList();
  }

  @Get(':ownerId')
  @HttpCode(200)
  @UseGuards(ZodValidationGuard({ params: ownerParamsSchema }))
  async getOwnerById(
    @Param('ownerId') ownerPublicId: string,
  ): Promise<PublicOwner> {
    return await this.ownerService.getOwnerById(ownerPublicId);
  }

  @Patch(':ownerId')
  @HttpCode(200)
  @UseGuards(
    ZodValidationGuard({
      params: ownerParamsSchema,
      body: updateOwnerSchema,
    }),
  )
  async updateOwner(
    @Param('ownerId') ownerPublicId: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ): Promise<PublicOwner> {
    return await this.ownerService.updateOwner(ownerPublicId, updateOwnerDto);
  }

  @Delete(':ownerId')
  @HttpCode(204)
  @UseGuards(ZodValidationGuard({ params: ownerParamsSchema }))
  async deleteOwner(@Param('ownerId') ownerPublicId: string): Promise<void> {
    await this.ownerService.deleteOwner(ownerPublicId);
  }
}

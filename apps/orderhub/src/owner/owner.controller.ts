import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { PublicOwner } from '@spaceorder/db';
import { OwnerPermission } from 'src/utils/guards/model-auth/owner-permission.guard';

export class CreateOwnerDto extends createZodDto(createOwnerSchema) {}
export class UpdateOwnerDto extends createZodDto(updateOwnerSchema) {}

@Controller('owners')
@UseGuards(JwtAuthGuard)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(ZodValidation({ body: createOwnerSchema }))
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
  @UseGuards(ZodValidation({ params: ownerParamsSchema }), OwnerPermission)
  async getOwnerById(@Param('ownerId') ownerId: string): Promise<PublicOwner> {
    return await this.ownerService.getOwnerById(ownerId);
  }

  @Patch(':ownerId')
  @HttpCode(200)
  @UseGuards(
    ZodValidation({
      params: ownerParamsSchema,
      body: updateOwnerSchema,
    }),
    OwnerPermission,
  )
  async updateOwner(
    @Param('ownerId') ownerId: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ): Promise<PublicOwner> {
    return await this.ownerService.updateOwner(ownerId, updateOwnerDto);
  }

  @Delete(':ownerId')
  @HttpCode(204)
  @UseGuards(ZodValidation({ params: ownerParamsSchema }), OwnerPermission)
  async deleteOwner(@Param('ownerId') ownerId: string): Promise<void> {
    await this.ownerService.deleteOwner(ownerId);
  }
}

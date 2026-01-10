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
import { OwnerResponseDto } from './dto/ownerResponse.dto';

export class CreateOwnerDto extends createZodDto(createOwnerSchema) {}
export class UpdateOwnerDto extends createZodDto(updateOwnerSchema) {}

/** TODO: Admin만 접근 가능하도록 Permission 데코레이터 추가 필요,
 * 본인의 데이터는 /me로 접근하도록 유도
 */

@Controller('owners')
@UseGuards(JwtAuthGuard)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @UseGuards(ZodValidation({ body: createOwnerSchema }))
  async createOwner(
    @Body() createOwnerDto: CreateOwnerDto,
  ): Promise<PublicOwner> {
    return await this.ownerService.createOwner(createOwnerDto);
  }

  @Get()
  async getOwnerList(): Promise<PublicOwner[]> {
    return await this.ownerService.getOwnerList();
  }

  @Get(':ownerId')
  @UseGuards(ZodValidation({ params: ownerParamsSchema }), OwnerPermission)
  @UseInterceptors(ClassSerializerInterceptor)
  async getOwnerById(@Param('ownerId') ownerId: string): Promise<PublicOwner> {
    const findOwner = await this.ownerService.getOwnerById(ownerId);
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
  async updateOwner(
    @Param('ownerId') ownerId: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ): Promise<PublicOwner> {
    return await this.ownerService.updateOwner(ownerId, updateOwnerDto);
  }

  @Delete(':ownerId')
  @UseGuards(ZodValidation({ params: ownerParamsSchema }), OwnerPermission)
  async deleteOwner(@Param('ownerId') ownerId: string): Promise<void> {
    await this.ownerService.deleteOwner(ownerId);
  }
}

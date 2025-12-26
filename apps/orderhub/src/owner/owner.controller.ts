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
import { OwnerResponseDto } from './dto/response-owner.dto';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import {
  createOwnerSchema,
  ownerParamsSchema,
  updateOwnerSchema,
} from '@spaceorder/auth';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';

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
  async create(@Body() createOwnerDto: CreateOwnerDto) {
    const createdOwner = await this.ownerService.create(createOwnerDto);
    return new OwnerResponseDto(createdOwner);
  }

  @Get()
  @HttpCode(200)
  async findAll() {
    const owners = await this.ownerService.findAll();
    return owners.map((owner) => new OwnerResponseDto(owner));
  }

  @Get(':ownerId')
  @HttpCode(200)
  @UseGuards(ZodValidationGuard({ params: ownerParamsSchema }))
  async findOne(@Param('ownerId') ownerPublicId: string) {
    const ownerByPublicId = await this.ownerService.findUnique(ownerPublicId);
    return new OwnerResponseDto(ownerByPublicId);
  }

  @Patch(':ownerId')
  @HttpCode(200)
  @UseGuards(
    ZodValidationGuard({ params: ownerParamsSchema, body: updateOwnerSchema }),
  )
  async update(
    @Param('ownerId') ownerPublicId: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    const updatedOwner = await this.ownerService.update(
      ownerPublicId,
      updateOwnerDto,
    );
    return new OwnerResponseDto(updatedOwner);
  }

  @Delete(':ownerId')
  @HttpCode(204)
  @UseGuards(ZodValidationGuard({ params: ownerParamsSchema }))
  async delete(@Param('ownerId') ownerPublicId: string) {
    await this.ownerService.delete(ownerPublicId);
  }
}

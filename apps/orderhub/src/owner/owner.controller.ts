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
  async createOwner(@Body() createOwnerDto: CreateOwnerDto) {
    const createdOwner = await this.ownerService.createOwner(createOwnerDto);
    return new OwnerResponseDto(createdOwner);
  }

  @Get()
  @HttpCode(200)
  async retrieveOwnerList() {
    const retrievedOwnerList = await this.ownerService.retrieveOwnerList();
    return retrievedOwnerList.map((owner) => new OwnerResponseDto(owner));
  }

  @Get(':ownerId')
  @HttpCode(200)
  @UseGuards(ZodValidationGuard({ params: ownerParamsSchema }))
  async retrieveOwnerById(@Param('ownerId') ownerPublicId: string) {
    const retrievedOwner =
      await this.ownerService.retrieveOwnerById(ownerPublicId);
    return new OwnerResponseDto(retrievedOwner);
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
  ) {
    const updatedOwner = await this.ownerService.updateOwner(
      ownerPublicId,
      updateOwnerDto,
    );
    return new OwnerResponseDto(updatedOwner);
  }

  @Delete(':ownerId')
  @HttpCode(204)
  @UseGuards(ZodValidationGuard({ params: ownerParamsSchema }))
  async deleteOwner(@Param('ownerId') ownerPublicId: string) {
    await this.ownerService.deleteOwner(ownerPublicId);
  }
}

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
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnerResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';

@Controller('owner')
@UseInterceptors(ClassSerializerInterceptor)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOwnerDto: CreateOwnerDto) {
    const createdOwner = await this.ownerService.create(createOwnerDto);
    return new OwnerResponseDto(createdOwner);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const owners = await this.ownerService.findAll();
    return owners.map((owner) => new OwnerResponseDto(owner));
  }

  @Get(':publicId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('publicId') publicId: string) {
    const ownerByPublicId = await this.ownerService.findOne(publicId);
    return new OwnerResponseDto(ownerByPublicId);
  }

  @Patch(':publicId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('publicId') publicId: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    const updatedOwner = await this.ownerService.update(
      publicId,
      updateOwnerDto,
    );
    return new OwnerResponseDto(updatedOwner);
  }

  @Delete(':publicId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('publicId') publicId: string) {
    await this.ownerService.remove(publicId);
  }
}

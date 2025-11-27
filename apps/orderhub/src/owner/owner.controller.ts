import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownerService.create(createOwnerDto);
  }

  @Get()
  findAll() {
    return this.ownerService.findAll();
  }

  @Get(':publicId')
  findOne(@Param('publicId') publicId: string) {
    return this.ownerService.findOne(publicId);
  }

  @Patch(':publicId')
  async update(
    @Param('publicId') publicId: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    return await this.ownerService.update(publicId, updateOwnerDto);
  }

  @Delete(':publicId')
  async remove(@Param('publicId') publicId: string) {
    await this.ownerService.remove(publicId);
  }
}

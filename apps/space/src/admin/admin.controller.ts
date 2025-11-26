import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @HttpCode(200)
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':publicId')
  @HttpCode(200)
  findOne(@Param('publicId') publicId: string) {
    return this.adminService.findOne(publicId);
  }

  @Patch(':publicId')
  @HttpCode(200)
  update(
    @Param('publicId') publicId: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.update(publicId, updateAdminDto);
  }

  @Delete(':publicId')
  @HttpCode(204)
  async remove(@Param('publicId') publicId: string) {
    await this.adminService.remove(publicId);
  }
}

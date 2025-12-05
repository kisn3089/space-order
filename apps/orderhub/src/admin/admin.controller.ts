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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard';
// import { CurrentAdmin } from '../auth/current-admin.decorator';
// import { Admin } from '@spaceorder/db/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.adminService.findAll();
  }

  @HttpCode(200)
  @Get(':publicId')
  async findOne(@Param('publicId') publicId: string) {
    return this.adminService.findOne(publicId);
  }

  @Patch(':publicId')
  @HttpCode(200)
  async update(
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

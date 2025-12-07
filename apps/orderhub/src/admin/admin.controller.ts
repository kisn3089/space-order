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
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard';
import { AdminResponseDto } from './dto/response.dto';

@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async create(@Body() createAdminDto: CreateAdminDto) {
    const createdAdmin = await this.adminService.create(createAdminDto);
    return new AdminResponseDto(createdAdmin);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const admins = await this.adminService.findAll();
    return admins.map((admin) => new AdminResponseDto(admin));
  }

  @Get(':publicId')
  @HttpCode(200)
  async findOne(@Param('publicId') publicId: string) {
    const adminByPublicId = await this.adminService.findOne(publicId);
    return new AdminResponseDto(adminByPublicId);
  }

  @Patch(':publicId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('publicId') publicId: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const updatedAdmin = await this.adminService.update(
      publicId,
      updateAdminDto,
    );
    return new AdminResponseDto(updatedAdmin);
  }

  @Delete(':publicId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('publicId') publicId: string) {
    await this.adminService.remove(publicId);
  }
}

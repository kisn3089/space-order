import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  DocsAdminCreate,
  DocsAdminDelete,
  DocsAdminGetList,
  DocsAdminGetUnique,
  DocsAdminUpdate,
} from 'src/docs/admin.docs';
import { PublicAdminDto } from 'src/dto/public/admin.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Client } from 'src/decorators/client.decorator';
import type { Admin, PublicAdmin } from '@spaceorder/db';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { CreateAdminDto, UpdateAdminDto } from 'src/dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admins')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @DocsAdminCreate()
  async create(@Body() createAdminDto: CreateAdminDto): Promise<PublicAdmin> {
    const createdAdmin = await this.adminService.createAdmin(createAdminDto);
    return new PublicAdminDto(createdAdmin);
  }

  @Get()
  @DocsAdminGetList()
  async getList(@Client() admin: Admin): Promise<PublicAdmin[]> {
    return await this.adminService.getList({
      where: { id: admin.id },
      omit: this.adminService.omitPrivate,
    });
  }

  @Get(':adminId')
  @DocsAdminGetUnique()
  async getUnique(@Param('adminId') adminId: string): Promise<PublicAdmin> {
    return await this.adminService.getUnique({
      where: { publicId: adminId },
      omit: this.adminService.omitPrivate,
    });
  }

  @Patch(':adminId')
  @DocsAdminUpdate()
  async partialUpdate(
    @Param('adminId') adminId: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<PublicAdmin> {
    const updatedAdmin = await this.adminService.partialUpdateAdmin(
      adminId,
      updateAdminDto,
    );
    return new PublicAdminDto(updatedAdmin);
  }

  @Delete(':adminId')
  @HttpCode(204)
  @DocsAdminDelete()
  async delete(@Param('adminId') adminId: string) {
    await this.adminService.deleteAdmin(adminId);
  }
}

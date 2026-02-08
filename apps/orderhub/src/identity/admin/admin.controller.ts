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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { adminDocs } from 'src/docs/admin.docs';
import { paramsDocs } from 'src/docs/params.docs';
import { PublicAdminDto } from 'src/dto/public/admin.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Client } from 'src/decorators/client.decorator';
import type { Admin, PublicAdmin } from '@spaceorder/db';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('identity/v1/admins')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: adminDocs.create.summary })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({
    ...adminDocs.create.successResponse,
    type: PublicAdminDto,
  })
  @ApiResponse(adminDocs.badRequestResponse)
  @ApiResponse(adminDocs.unauthorizedResponse)
  async create(@Body() createAdminDto: CreateAdminDto): Promise<PublicAdmin> {
    const createdAdmin = await this.adminService.createAdmin(createAdminDto);
    return new PublicAdminDto(createdAdmin);
  }

  @Get()
  @ApiOperation({ summary: adminDocs.getList.summary })
  @ApiResponse({
    ...adminDocs.getList.successResponse,
    type: [PublicAdminDto],
  })
  @ApiResponse(adminDocs.unauthorizedResponse)
  async getList(@Client() admin: Admin): Promise<PublicAdmin[]> {
    return await this.adminService.getList({
      where: { id: admin.id },
      omit: this.adminService.omitPrivate,
    });
  }

  @Get(':adminId')
  @ApiOperation({ summary: adminDocs.getUnique.summary })
  @ApiParam(paramsDocs.adminId)
  @ApiResponse({
    ...adminDocs.getUnique.successResponse,
    type: PublicAdminDto,
  })
  @ApiResponse(adminDocs.notFoundResponse)
  async getUnique(@Param('adminId') adminId: string): Promise<PublicAdmin> {
    return await this.adminService.getUnique({
      where: { publicId: adminId },
      omit: this.adminService.omitPrivate,
    });
  }

  @Patch(':adminId')
  @ApiOperation({ summary: adminDocs.update.summary })
  @ApiParam(paramsDocs.adminId)
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({
    ...adminDocs.update.successResponse,
    type: PublicAdminDto,
  })
  @ApiResponse(adminDocs.badRequestResponse)
  @ApiResponse(adminDocs.unauthorizedResponse)
  @ApiResponse(adminDocs.notFoundResponse)
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
  @ApiOperation({ summary: adminDocs.delete.summary })
  @ApiParam(paramsDocs.adminId)
  @ApiResponse(adminDocs.delete.successResponse)
  @ApiResponse(adminDocs.unauthorizedResponse)
  @ApiResponse(adminDocs.notFoundResponse)
  async delete(@Param('adminId') adminId: string) {
    await this.adminService.deleteAdmin(adminId);
  }
}

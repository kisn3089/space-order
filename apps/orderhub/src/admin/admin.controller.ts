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
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { AdminResponseDto } from './dto/adminResponse.dto';
import { adminDocs } from 'src/docs/admin.docs';
import { paramsDocs } from 'src/docs/params.docs';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: adminDocs.create.summary })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({
    ...adminDocs.create.successResponse,
    type: AdminResponseDto,
  })
  @ApiResponse(adminDocs.badRequestResponse)
  @ApiResponse(adminDocs.unauthorizedResponse)
  async create(@Body() createAdminDto: CreateAdminDto) {
    const createdAdmin = await this.adminService.createAdmin(createAdminDto);
    return new AdminResponseDto(createdAdmin);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: adminDocs.getList.summary })
  @ApiResponse({
    ...adminDocs.getList.successResponse,
    type: [AdminResponseDto],
  })
  @ApiResponse(adminDocs.unauthorizedResponse)
  async getList() {
    const admins = await this.adminService.getAdminList();
    return admins.map((admin) => new AdminResponseDto(admin));
  }

  @Get(':adminId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: adminDocs.getUnique.summary })
  @ApiParam(paramsDocs.adminId)
  @ApiResponse({
    ...adminDocs.getUnique.successResponse,
    type: AdminResponseDto,
  })
  @ApiResponse(adminDocs.notFoundResponse)
  async getUnique(@Param('adminId') adminId: string) {
    const adminByPublicId = await this.adminService.getAdminUnique(adminId);
    return new AdminResponseDto(adminByPublicId);
  }

  @Patch(':adminId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: adminDocs.update.summary })
  @ApiParam(paramsDocs.adminId)
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({
    ...adminDocs.update.successResponse,
    type: AdminResponseDto,
  })
  @ApiResponse(adminDocs.badRequestResponse)
  @ApiResponse(adminDocs.unauthorizedResponse)
  @ApiResponse(adminDocs.notFoundResponse)
  async partialUpdate(
    @Param('adminId') adminId: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const updatedAdmin = await this.adminService.partialUpdateAdmin(
      adminId,
      updateAdminDto,
    );
    return new AdminResponseDto(updatedAdmin);
  }

  @Delete(':adminId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: adminDocs.delete.summary })
  @ApiParam(paramsDocs.adminId)
  @ApiResponse(adminDocs.delete.successResponse)
  @ApiResponse(adminDocs.unauthorizedResponse)
  @ApiResponse(adminDocs.notFoundResponse)
  async delete(@Param('adminId') adminId: string) {
    await this.adminService.deleteAdmin(adminId);
  }
}

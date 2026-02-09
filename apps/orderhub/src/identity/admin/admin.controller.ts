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
import {
  CreateAdminPayloadDto,
  UpdateAdminPayloadDto,
} from 'src/dto/admin.dto';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import {
  adminIdParamsSchema,
  createAdminPayloadSchema,
  updateAdminPayloadSchema,
} from '@spaceorder/api/schemas/model/admin.schema';
import { AdminAccessGuard } from 'src/utils/guards/admin-access.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admins')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @UseGuards(ZodValidation({ body: createAdminPayloadSchema }))
  @DocsAdminCreate()
  async create(
    @Body() createAdminPayload: CreateAdminPayloadDto,
  ): Promise<PublicAdmin> {
    const createdAdmin =
      await this.adminService.createAdmin(createAdminPayload);
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
  @UseGuards(ZodValidation({ params: adminIdParamsSchema }))
  @DocsAdminGetUnique()
  async getUnique(@Param('adminId') adminId: string): Promise<PublicAdmin> {
    return await this.adminService.getUnique({
      where: { publicId: adminId },
      omit: this.adminService.omitPrivate,
    });
  }

  @Patch(':adminId')
  @UseGuards(
    ZodValidation({
      params: adminIdParamsSchema,
      body: updateAdminPayloadSchema,
    }),
  )
  @DocsAdminUpdate()
  async partialUpdate(
    @Param('adminId') adminId: string,
    @Body() updateAdminPayload: UpdateAdminPayloadDto,
  ): Promise<PublicAdmin> {
    const updatedAdmin = await this.adminService.partialUpdateAdmin(
      adminId,
      updateAdminPayload,
    );
    return new PublicAdminDto(updatedAdmin);
  }

  @Delete(':adminId')
  @UseGuards(ZodValidation({ params: adminIdParamsSchema }))
  @HttpCode(204)
  @DocsAdminDelete()
  async delete(@Param('adminId') adminId: string) {
    await this.adminService.deleteAdmin(adminId);
  }
}

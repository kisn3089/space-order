import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt } from 'src/utils/lib/crypt';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAdmin(createAdminDto: CreateAdminDto) {
    const hashedPassword = await encrypt(createAdminDto.password);
    const createdAdmin = await this.prismaService.admin.create({
      data: {
        ...createAdminDto,
        password: hashedPassword,
      },
    });
    return createdAdmin;
  }

  async getAdminList() {
    return await this.prismaService.admin.findMany({});
  }

  async getAdminUnique(publicId: string) {
    return await this.prismaService.admin.findUniqueOrThrow({
      where: { publicId },
    });
  }

  async partialUpdateAdmin(publicId: string, updateAdminDto: UpdateAdminDto) {
    return await this.prismaService.admin.update({
      where: { publicId },
      data: updateAdminDto,
    });
  }

  async updateRefreshToken(publicId: string, refreshToken: string) {
    return await this.prismaService.admin.update({
      where: { publicId },
      data: { refreshToken },
      omit: {
        id: true,
        password: true,
        refreshToken: true,
      },
    });
  }

  async deleteAdmin(publicId: string) {
    return await this.prismaService.admin.delete({
      where: { publicId },
    });
  }

  async updateLastSignIn(publicId: string) {
    return await this.prismaService.admin.update({
      where: { publicId },
      data: { lastLoginAt: new Date() },
      omit: {
        id: true,
        password: true,
        refreshToken: true,
      },
    });
  }
}

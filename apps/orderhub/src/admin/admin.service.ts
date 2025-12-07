import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { encryptPassword } from 'utils/lib/crypt';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const hashedPassword = await encryptPassword(createAdminDto.password);
    const createdAdmin = await this.prismaService.admin.create({
      data: {
        ...createAdminDto,
        password: hashedPassword,
      },
    });
    return createdAdmin;
  }

  async findAll() {
    return await this.prismaService.admin.findMany({});
  }

  async findOne(publicId: string) {
    const admin = await this.prismaService.admin.findUnique({
      where: { publicId },
    });

    if (!admin) {
      throw new NotFoundException(`Not Found Admin`);
    }

    return admin;
  }

  async findByEmail(email: string) {
    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new NotFoundException(`Not Found Admin`);
    }

    return admin;
  }

  async update(publicId: string, updateAdminDto: UpdateAdminDto) {
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

  async remove(publicId: string) {
    /**
     * 전역 catch 이전에 먼저 처리된다.
     * const admin = await this.prismaService.admin.findUnique({ where: { id } });
     * if (!admin) {
     *    throw new NotFoundException(`관리자 ID ${id}를 찾을 수 없습니다.`);
     * }
     */
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

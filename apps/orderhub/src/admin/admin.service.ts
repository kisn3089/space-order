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
      omit: {
        id: true,
        password: true,
      },
    });
    return createdAdmin;
  }

  async findAll() {
    return await this.prismaService.admin.findMany({
      omit: {
        id: true,
        password: true,
      },
    });
  }

  async findOne(publicId: string) {
    const admin = await this.prismaService.admin.findUnique({
      where: { publicId },
      omit: {
        id: true,
        password: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`존재하지 않는 관리자입니다.`);
    }

    return admin;
  }

  async findByEmail(email: string) {
    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new NotFoundException(`존재하지 않는 관리자입니다.`);
    }

    return admin;
  }

  async update(publicId: string, updateAdminDto: UpdateAdminDto) {
    return await this.prismaService.admin.update({
      where: { publicId },
      data: updateAdminDto,
      omit: {
        id: true,
        password: true,
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

  async updateLastSignin(publicId: string) {
    return await this.prismaService.admin.update({
      where: { publicId },
      data: { lastLoginAt: new Date() },
      omit: {
        id: true,
        password: true,
      },
    });
  }
}

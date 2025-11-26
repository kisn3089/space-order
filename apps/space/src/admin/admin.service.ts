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

    return this.prismaService.admin.create({
      data: {
        ...createAdminDto,
        password: hashedPassword,
      },
    });
  }

  async findAll() {
    return await this.prismaService.admin.findMany({});
  }

  async findOne(id: number) {
    return await this.prismaService.admin.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    return await this.prismaService.admin.update({
      where: { id },
      data: updateAdminDto,
    });
  }

  async remove(id: number) {
    try {
      return await this.prismaService.admin.delete({
        where: { id },
      });
    } catch (error) {
      // Prisma P2025: Record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`Admin with ID ${id} not found`);
      }
      throw error;
    }
  }
}

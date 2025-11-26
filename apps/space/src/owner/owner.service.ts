import { Injectable } from '@nestjs/common';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { encryptPassword } from 'utils/lib/crypt';

@Injectable()
export class OwnerService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOwnerDto: CreateOwnerDto) {
    const hashedPassword = await encryptPassword(createOwnerDto.password);

    const owner = await this.prismaService.owner.create({
      data: {
        ...createOwnerDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        publicId: true, // 외부 노출용
        email: true,
        name: true,
        phone: true,
        businessNumber: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // password는 제외
      },
    });

    return owner;
  }

  async findAll() {
    return await this.prismaService.owner.findMany({
      select: {
        id: true,
        publicId: true,
        email: true,
        name: true,
        phone: true,
        businessNumber: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(publicId: string) {
    return await this.prismaService.owner.findUnique({
      where: { publicId },
      select: {
        publicId: true,
        email: true,
        name: true,
        phone: true,
        businessNumber: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(publicId: string, updateOwnerDto: UpdateOwnerDto) {
    return await this.prismaService.owner.update({
      where: { publicId },
      data: updateOwnerDto,
      select: {
        publicId: true,
        email: true,
        name: true,
        phone: true,
        businessNumber: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(publicId: string) {
    return await this.prismaService.owner.delete({
      where: { publicId },
    });
  }
}

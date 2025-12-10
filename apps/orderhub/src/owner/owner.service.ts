import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { PrismaService } from '../prisma/prisma.service';
import { encryptPassword } from 'src/utils/lib/crypt';

@Injectable()
export class OwnerService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOwnerDto: CreateOwnerDto) {
    const hashedPassword = await encryptPassword(createOwnerDto.password);
    const createdOwner = await this.prismaService.owner.create({
      data: {
        ...createOwnerDto,
        password: hashedPassword,
      },
    });

    return createdOwner;
  }

  async findAll() {
    return await this.prismaService.owner.findMany({});
  }

  async findOne(publicId: string) {
    const owner = await this.prismaService.owner.findUnique({
      where: { publicId },
    });

    if (!owner) {
      throw new NotFoundException(`Not Found Owner`);
    }

    return owner;
  }

  async findByEmail(email: string) {
    const owner = await this.prismaService.owner.findUnique({
      where: { email },
    });

    if (!owner) {
      throw new NotFoundException(`Not Found Owner`);
    }
    return owner;
  }

  async update(publicId: string, updateOwnerDto: UpdateOwnerDto) {
    return await this.prismaService.owner.update({
      where: { publicId },
      data: updateOwnerDto,
    });
  }

  async updateRefreshToken(publicId: string, refreshToken: string) {
    return await this.prismaService.owner.update({
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
    return await this.prismaService.owner.delete({
      where: { publicId },
    });
  }

  async updateLastSignIn(publicId: string) {
    return await this.prismaService.owner.update({
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

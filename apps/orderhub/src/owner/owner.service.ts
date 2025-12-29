import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt } from 'src/utils/lib/crypt';
import { CreateOwnerDto, UpdateOwnerDto } from './owner.controller';

@Injectable()
export class OwnerService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOwner(createOwnerDto: CreateOwnerDto) {
    const encryptedPassword = await encrypt(createOwnerDto.password);
    const createdOwner = await this.prismaService.owner.create({
      data: {
        ...createOwnerDto,
        password: encryptedPassword,
      },
    });

    return createdOwner;
  }

  async retrieveOwnerList() {
    const retrievedOwnerList = await this.prismaService.owner.findMany({});
    return retrievedOwnerList;
  }

  async retrieveOwnerById(ownerPublicId: string) {
    const retrievedOwner = await this.prismaService.owner.findUniqueOrThrow({
      where: { publicId: ownerPublicId },
    });

    return retrievedOwner;
  }

  async retrieveOwnerByEmail(email: string) {
    const retrievedOwner = await this.prismaService.owner.findUnique({
      where: { email },
    });

    return retrievedOwner;
  }

  async updateOwner(ownerPublicId: string, updateOwnerDto: UpdateOwnerDto) {
    const updatedOwner = await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: { ...updateOwnerDto },
    });

    return updatedOwner;
  }

  async deleteOwner(ownerPublicId: string) {
    const deletedOwner = await this.prismaService.owner.delete({
      where: { publicId: ownerPublicId },
    });

    return deletedOwner;
  }

  async updateRefreshToken(ownerPublicId: string, refreshToken: string) {
    const updatedRefreshToken = await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: { lastLoginAt: new Date(), refreshToken },
    });

    return updatedRefreshToken;
  }
}

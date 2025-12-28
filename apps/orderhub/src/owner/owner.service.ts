import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt } from 'src/utils/lib/crypt';
import { CreateOwnerDto, UpdateOwnerDto } from './owner.controller';
import { responseMessage } from 'src/common/constants/response-message';

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

    if (!createdOwner) {
      console.warn('Failed to create owner');
      throw new BadRequestException(responseMessage('invalidBody'));
    }

    return createdOwner;
  }

  async retrieveOwnerList() {
    const retrievedOwnerList = await this.prismaService.owner.findMany({});

    if (!retrievedOwnerList) {
      console.warn('Failed to retrieve owner list');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return retrievedOwnerList;
  }

  async retrieveOwnerById(ownerPublicId: string) {
    const retrievedOwner = await this.prismaService.owner.findUnique({
      where: { publicId: ownerPublicId },
    });

    if (!retrievedOwner) {
      console.warn('Failed to retrieve owner by id');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return retrievedOwner;
  }

  async retrieveOwnerByEmail(email: string) {
    const retrievedOwner = await this.prismaService.owner.findUnique({
      where: { email },
    });

    if (!retrievedOwner) {
      console.warn('Failed to retrieve owner by email');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return retrievedOwner;
  }

  async updateOwner(ownerPublicId: string, updateOwnerDto: UpdateOwnerDto) {
    const updatedOwner = await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: { ...updateOwnerDto },
    });

    if (!updatedOwner) {
      console.warn('Failed to update owner');
      throw new BadRequestException(responseMessage('invalidBody'));
    }

    return updatedOwner;
  }

  async deleteOwner(ownerPublicId: string) {
    const deletedOwner = await this.prismaService.owner.delete({
      where: { publicId: ownerPublicId },
    });

    if (!deletedOwner) {
      console.warn('Failed to delete owner');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return deletedOwner;
  }

  async updateRefreshToken(ownerPublicId: string, refreshToken: string) {
    const updatedRefreshToken = await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: { lastLoginAt: new Date(), refreshToken },
    });

    if (!updatedRefreshToken) {
      console.warn('Failed to update owner signIn info');
      throw new BadRequestException(responseMessage('invalidBody'));
    }

    return updatedRefreshToken;
  }
}

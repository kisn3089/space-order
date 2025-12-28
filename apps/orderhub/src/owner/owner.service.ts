import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encryptPassword } from 'src/utils/lib/crypt';
import { CreateOwnerDto, UpdateOwnerDto } from './owner.controller';
import { responseMessage } from 'src/common/constants/response-message';

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

    if (!createdOwner) {
      console.warn('Failed to create owner');
      throw new BadRequestException(responseMessage('invalidBody'));
    }

    return createdOwner;
  }

  async findAll() {
    const foundOwners = await this.prismaService.owner.findMany({});

    if (!foundOwners) {
      console.warn('Failed to find owners');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return foundOwners;
  }

  async findUnique(ownerPublicId: string) {
    const foundOwner = await this.prismaService.owner.findUnique({
      where: { publicId: ownerPublicId },
    });

    if (!foundOwner) {
      console.warn('Failed to find owners');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return foundOwner;
  }

  async findByEmail(email: string) {
    const foundOwner = await this.prismaService.owner.findUnique({
      where: { email },
    });

    if (!foundOwner) {
      console.warn('Failed to findByEmail to owner');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return foundOwner;
  }

  async update(ownerPublicId: string, updateOwnerDto: UpdateOwnerDto) {
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

  async delete(ownerPublicId: string) {
    const deletedOwner = await this.prismaService.owner.delete({
      where: { publicId: ownerPublicId },
    });

    if (!deletedOwner) {
      console.warn('Failed to delete owner');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return deletedOwner;
  }

  /**
   * @description
   * Updates the lastLoginAt timestamp and stores the hashed refresh token.
   * @param ownerPublicId - The public ID of the owner to update
   * @param refreshToken - The hashed refresh token to store
   * @returns Updated Owner entity without sensitive fields (id, password, refreshToken)
   * @throws {BadRequestException} When the owner is not found or update fails
   * @see {@link tokenService.create}
   */
  async updateSignInInfo(ownerPublicId: string, refreshToken: string) {
    const updatedOwnerSignInInfo = await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: { lastLoginAt: new Date(), refreshToken },
    });

    if (!updatedOwnerSignInInfo) {
      console.warn('Failed to update owner signIn info');
      throw new BadRequestException(responseMessage('invalidBody'));
    }

    return updatedOwnerSignInInfo;
  }
}

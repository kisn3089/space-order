import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt } from 'src/utils/lib/crypt';
import { CreateOwnerDto, UpdateOwnerDto } from './owner.controller';
import { Owner, PublicOwner } from '@spaceorder/db';

@Injectable()
export class OwnerService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly ownerOmit = { id: true, password: true, refreshToken: true };

  async createOwner(createOwnerDto: CreateOwnerDto): Promise<PublicOwner> {
    const encryptedPassword = await encrypt(createOwnerDto.password);
    const createdOwner = await this.prismaService.owner.create({
      data: { ...createOwnerDto, password: encryptedPassword },
      omit: this.ownerOmit,
    });

    return createdOwner;
  }

  async getOwnerList(): Promise<PublicOwner[]> {
    return await this.prismaService.owner.findMany({
      omit: this.ownerOmit,
    });
  }

  async getOwnerById(ownerPublicId: string): Promise<Owner> {
    return await this.prismaService.owner.findFirstOrThrow({
      where: { publicId: ownerPublicId },
    });
  }

  /**
   * This method is used for validating owner sign-in
   * For user-facing endpoints, use @class OwnerResponseDto instead.
   */
  async getOwnerByEmail(email: string): Promise<Owner> {
    return await this.prismaService.owner.findUniqueOrThrow({
      where: { email },
    });
  }

  async updateOwner(
    ownerPublicId: string,
    updateOwnerDto: UpdateOwnerDto,
  ): Promise<PublicOwner> {
    return await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: updateOwnerDto,
      omit: this.ownerOmit,
    });
  }

  async deleteOwner(ownerPublicId: string): Promise<PublicOwner> {
    return await this.prismaService.owner.delete({
      where: { publicId: ownerPublicId },
      omit: this.ownerOmit,
    });
  }

  async updateRefreshToken(
    ownerPublicId: string,
    refreshToken: string,
  ): Promise<PublicOwner> {
    return await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: { lastLoginAt: new Date(), refreshToken },
      omit: this.ownerOmit,
    });
  }
}

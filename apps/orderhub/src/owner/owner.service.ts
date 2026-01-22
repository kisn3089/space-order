import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt } from 'src/utils/lib/crypt';
import { CreateOwnerDto, UpdateOwnerDto } from './owner.controller';
import { Prisma, ResponseOwner } from '@spaceorder/db';

@Injectable()
export class OwnerService {
  constructor(private readonly prismaService: PrismaService) {}

  ownerOmit = { id: true, password: true, refreshToken: true } as const;

  async createOwner(createOwnerDto: CreateOwnerDto): Promise<ResponseOwner> {
    const encryptedPassword = await encrypt(createOwnerDto.password);
    const createdOwner = await this.prismaService.owner.create({
      data: { ...createOwnerDto, password: encryptedPassword },
      omit: this.ownerOmit,
    });

    return createdOwner;
  }

  async getOwnerList<T extends Prisma.OwnerFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.OwnerFindManyArgs>,
  ): Promise<Prisma.OwnerGetPayload<T>[]> {
    return await this.prismaService.owner.findMany(args);
  }

  /**
   * This method is used for validating owner sign-in
   * For user-facing endpoints, use @class OwnerResponseDto instead.
   */
  async getOwnerUnique<T extends Prisma.OwnerFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.OwnerFindFirstOrThrowArgs>,
  ): Promise<Prisma.OwnerGetPayload<T>> {
    return await this.prismaService.owner.findFirstOrThrow(args);
  }

  async partialUpdateOwner(
    ownerPublicId: string,
    updateOwnerDto: UpdateOwnerDto,
  ): Promise<ResponseOwner> {
    return await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: updateOwnerDto,
      omit: this.ownerOmit,
    });
  }

  async deleteOwner(ownerPublicId: string): Promise<ResponseOwner> {
    return await this.prismaService.owner.delete({
      where: { publicId: ownerPublicId },
      omit: this.ownerOmit,
    });
  }

  async updateRefreshToken(
    ownerPublicId: string,
    refreshToken: string,
  ): Promise<ResponseOwner> {
    return await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: { lastLoginAt: new Date(), refreshToken },
      omit: this.ownerOmit,
    });
  }
}

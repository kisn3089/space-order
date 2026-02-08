import { Injectable } from '@nestjs/common';
import { encrypt } from 'src/utils/lib/crypt';
import { CreateOwnerDto, UpdateOwnerDto } from './owner.controller';
import { Prisma, PublicOwner } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerService {
  constructor(private readonly prismaService: PrismaService) {}
  omitPrivate = { id: true, password: true, refreshToken: true } as const;

  async createOwner(createOwnerPayload: CreateOwnerDto): Promise<PublicOwner> {
    const encryptedPassword = await encrypt(createOwnerPayload.password);
    const createdOwner = await this.prismaService.owner.create({
      data: { ...createOwnerPayload, password: encryptedPassword },
      omit: this.omitPrivate,
    });

    return createdOwner;
  }

  async getList<T extends Prisma.OwnerFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.OwnerFindManyArgs>,
  ): Promise<Prisma.OwnerGetPayload<T>[]> {
    return await this.prismaService.owner.findMany(args);
  }

  async getUnique<T extends Prisma.OwnerFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.OwnerFindFirstOrThrowArgs>,
  ): Promise<Prisma.OwnerGetPayload<T>> {
    return await this.prismaService.owner.findFirstOrThrow(args);
  }

  async partialUpdateOwner(
    publicId: string,
    updateOwnerPayload: UpdateOwnerDto,
  ): Promise<PublicOwner> {
    return await this.prismaService.owner.update({
      where: { publicId: publicId },
      data: updateOwnerPayload,
      omit: this.omitPrivate,
    });
  }

  async updateRefreshToken(
    publicId: string,
    refreshToken: string,
  ): Promise<PublicOwner> {
    return await this.prismaService.owner.update({
      where: { publicId: publicId },
      data: { lastLoginAt: new Date(), refreshToken },
      omit: this.omitPrivate,
    });
  }

  async deleteOwner(publicId: string): Promise<PublicOwner> {
    return await this.prismaService.owner.delete({
      where: { publicId: publicId },
      omit: this.omitPrivate,
    });
  }
}

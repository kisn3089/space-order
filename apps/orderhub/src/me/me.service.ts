import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublicOwner } from '@spaceorder/db';
import { UpdateOwnerPayloadDto } from 'src/dto/owner.dto';

@Injectable()
export class MeService {
  constructor(private readonly prismaService: PrismaService) {}
  omitPrivate = { id: true, password: true, refreshToken: true } as const;

  async partialUpdateOwner(
    ownerPublicId: string,
    updatePayload: UpdateOwnerPayloadDto,
  ): Promise<PublicOwner> {
    return await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: updatePayload,
      omit: this.omitPrivate,
    });
  }
}

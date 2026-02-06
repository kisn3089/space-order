import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PublicMenu } from '@spaceorder/db';
import { CreateMenuPayloadDto, UpdateMenuPayloadDto } from 'src/dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}
  omitPrivate = { id: true, storeId: true } as const;

  async createMenu(
    storeId: string,
    createPayload: CreateMenuPayloadDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.create({
      data: {
        store: { connect: { publicId: storeId } },
        ...createPayload,
      },
      omit: this.omitPrivate,
    });
  }

  async getMenuList<T extends Prisma.MenuFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.MenuFindManyArgs>,
  ): Promise<Prisma.MenuGetPayload<T>[]> {
    return await this.prismaService.menu.findMany(args);
  }

  async getMenuUnique<T extends Prisma.MenuFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.MenuFindFirstOrThrowArgs>,
  ): Promise<Prisma.MenuGetPayload<T>> {
    return await this.prismaService.menu.findFirstOrThrow(args);
  }

  async partialUpdateMenu(
    menuId: string,
    updatePayload: UpdateMenuPayloadDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.update({
      where: { publicId: menuId },
      data: updatePayload,
      omit: this.omitPrivate,
    });
  }

  async softDeleteMenu(menuId: string): Promise<void> {
    await this.prismaService.menu.update({
      where: { publicId: menuId },
      data: { deletedAt: new Date() },
    });
  }
}

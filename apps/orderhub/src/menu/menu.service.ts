import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ResponseMenu } from '@spaceorder/db';
import { CreateMenuDto, UpdateMenuDto } from './menu.controller';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}
  menuOmit = { id: true, storeId: true } as const;

  async createMenu(
    storeId: string,
    createMenuDto: CreateMenuDto,
  ): Promise<ResponseMenu> {
    return await this.prismaService.menu.create({
      data: {
        store: { connect: { publicId: storeId } },
        ...createMenuDto,
      },
      omit: this.menuOmit,
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
    updateMenuDto: UpdateMenuDto,
  ): Promise<ResponseMenu> {
    return await this.prismaService.menu.update({
      where: { publicId: menuId },
      data: updateMenuDto,
      omit: this.menuOmit,
    });
  }

  async softDeleteMenu(menuId: string): Promise<void> {
    await this.prismaService.menu.update({
      where: { publicId: menuId },
      data: { deletedAt: new Date() },
    });
  }
}

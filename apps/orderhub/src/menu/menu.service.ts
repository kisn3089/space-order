import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PublicMenu } from '@spaceorder/db';
import { CreateMenuDto, UpdateMenuDto } from './menu.controller';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}

  async createMenu(
    storePublicId: string,
    createMenuDto: CreateMenuDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.create({
      data: {
        store: { connect: { publicId: storePublicId } },
        ...createMenuDto,
      },
      omit: { id: true, storeId: true },
    });
  }

  async getMenuList(storePublicId: string): Promise<PublicMenu[]> {
    return await this.prismaService.menu.findMany({
      where: { store: { publicId: storePublicId } },
      omit: { id: true, storeId: true },
    });
  }

  async getMenuById(
    storePublicId: string,
    menuPublicId: string,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.findUniqueOrThrow({
      where: { publicId: menuPublicId, store: { publicId: storePublicId } },
      omit: { id: true, storeId: true },
    });
  }

  async updateMenu(
    storePublicId: string,
    menuPublicId: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.update({
      where: { publicId: menuPublicId, store: { publicId: storePublicId } },
      data: updateMenuDto,
      omit: { id: true, storeId: true },
    });
  }

  async deleteMenu(
    storePublicId: string,
    menuPublicId: string,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.delete({
      where: { publicId: menuPublicId, store: { publicId: storePublicId } },
      omit: { id: true, storeId: true },
    });
  }
}

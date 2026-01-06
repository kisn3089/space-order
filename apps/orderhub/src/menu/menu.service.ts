import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Owner, PublicMenu } from '@spaceorder/db';
import { CreateMenuDto, UpdateMenuDto } from './menu.controller';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly menuOmit = { id: true, storeId: true };

  async createMenu(
    storeId: string,
    createMenuDto: CreateMenuDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.create({
      data: {
        store: { connect: { publicId: storeId } },
        ...createMenuDto,
      },
      omit: this.menuOmit,
    });
  }

  async getMenuList(client: Owner, storeId: string): Promise<PublicMenu[]> {
    return await this.prismaService.menu.findMany({
      where: { store: { publicId: storeId, owner: { id: client.id } } },
      omit: this.menuOmit,
    });
  }

  async getMenuById(storeId: string, menuId: string): Promise<PublicMenu> {
    return await this.prismaService.menu.findFirstOrThrow({
      where: { publicId: menuId, store: { publicId: storeId } },
      omit: this.menuOmit,
    });
  }

  async updateMenu(
    menuId: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.update({
      where: { publicId: menuId },
      data: updateMenuDto,
      omit: this.menuOmit,
    });
  }

  async deleteMenu(menuId: string): Promise<void> {
    await this.prismaService.menu.delete({
      where: { publicId: menuId },
      omit: this.menuOmit,
    });
  }
}

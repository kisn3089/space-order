import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Owner, PublicMenu } from '@spaceorder/db';
import { CreateMenuDto, UpdateMenuDto } from './menu.controller';

type MenuBaseParams = { storePublicId: string };
type MenuIdParams = { menuPublicId: string };

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly menuOmit = { id: true, storeId: true };

  async createMenu(
    { storePublicId }: MenuBaseParams,
    createMenuDto: CreateMenuDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.create({
      data: {
        store: { connect: { publicId: storePublicId } },
        ...createMenuDto,
      },
      omit: this.menuOmit,
    });
  }

  async getMenuList(
    client: Owner,
    { storePublicId }: MenuBaseParams,
  ): Promise<PublicMenu[]> {
    return await this.prismaService.menu.findMany({
      where: { store: { publicId: storePublicId, owner: { id: client.id } } },
      omit: this.menuOmit,
    });
  }

  async getMenuById({
    storePublicId,
    menuPublicId,
  }: MenuBaseParams & MenuIdParams): Promise<PublicMenu> {
    {
      return await this.prismaService.menu.findFirstOrThrow({
        where: { publicId: menuPublicId, store: { publicId: storePublicId } },
        omit: this.menuOmit,
      });
    }
  }

  async updateMenu(
    { menuPublicId }: MenuIdParams,
    updateMenuDto: UpdateMenuDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.menu.update({
      where: { publicId: menuPublicId },
      data: updateMenuDto,
      omit: this.menuOmit,
    });
  }

  async deleteMenu({ menuPublicId }: MenuIdParams): Promise<void> {
    await this.prismaService.menu.delete({
      where: { publicId: menuPublicId },
      omit: this.menuOmit,
    });
  }
}

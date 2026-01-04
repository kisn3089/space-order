import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Owner, PublicMenu } from '@spaceorder/db';
import { CreateMenuDto, UpdateMenuDto } from './menu.controller';
import { Tx } from 'src/utils/helper/transactionPipe';

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

  txableGetMenuById(tx?: Tx) {
    const txableService = tx ?? this.prismaService;
    return async ({
      storePublicId,
      menuPublicId,
    }: MenuBaseParams & MenuIdParams): Promise<PublicMenu> => {
      return await txableService.menu.findFirstOrThrow({
        where: { publicId: menuPublicId, store: { publicId: storePublicId } },
        omit: this.menuOmit,
      });
    };
  }

  async updateMenu(
    { storePublicId, menuPublicId }: MenuBaseParams & MenuIdParams,
    updateMenuDto: UpdateMenuDto,
  ): Promise<PublicMenu> {
    return await this.prismaService.$transaction(async (tx) => {
      await this.txableGetMenuById(tx)({ storePublicId, menuPublicId });

      const updatedMenu = await tx.menu.update({
        where: { publicId: menuPublicId },
        data: updateMenuDto,
        omit: this.menuOmit,
      });
      return updatedMenu;
    });
  }

  async deleteMenu({
    storePublicId,
    menuPublicId,
  }: MenuBaseParams & MenuIdParams): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      await this.txableGetMenuById(tx)({ storePublicId, menuPublicId });

      await tx.menu.delete({
        where: { publicId: menuPublicId },
        omit: this.menuOmit,
      });
    });
  }
}

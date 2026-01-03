import { Injectable } from '@nestjs/common';
// import { CreateMenuDto } from './dto/create-menu.dto';
// import { UpdateMenuDto } from './dto/update-menu.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PublicMenu } from '@spaceorder/db';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}

  // create(createMenuDto: CreateMenuDto) {
  //   return 'This action adds a new menu';
  // }

  async retrieveMenuList(storePublicId: string): Promise<PublicMenu[]> {
    return await this.prismaService.menu.findMany({
      where: { store: { publicId: storePublicId } },
      omit: { id: true, storeId: true },
    });
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} menu`;
  // }

  // update(id: number, updateMenuDto: UpdateMenuDto) {
  //   return `This action updates a #${id} menu`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} menu`;
  // }
}

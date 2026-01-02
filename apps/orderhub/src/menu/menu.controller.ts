import {
  Controller,
  Get,
  // Post,
  Body,
  // Patch,
  Param,
  // Delete,
} from '@nestjs/common';
import { MenuService } from './menu.service';
// import { CreateMenuDto } from './dto/create-menu.dto';
// import { UpdateMenuDto } from './dto/update-menu.dto';
import { PublicMenu } from '@spaceorder/db';

@Controller('stores/:storeId/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // MenuResponseDto
  // @Post()
  // create(@Body() createMenuDto: CreateMenuDto) {
  //   return this.menuService.create(createMenuDto);
  // }

  @Get()
  async retrieveMenuList(
    @Param('storeId') storePublicId: string,
  ): Promise<PublicMenu[]> {
    return await this.menuService.retrieveMenuList(storePublicId);
  }

  // @Get(':menuId')
  // findOne(@Param('menuId') menuId: string) {
  //   return this.menuService.findOne(+menuId);
  // }

  // @Patch(':menuId')
  // update(
  //   @Param('menuId') menuId: string,
  //   @Body() updateMenuDto: UpdateMenuDto,
  // ) {
  //   return this.menuService.update(+menuId, updateMenuDto);
  // }

  // @Delete(':menuId')
  // remove(@Param('menuId') menuId: string) {
  //   return this.menuService.remove(+menuId);
  // }
}

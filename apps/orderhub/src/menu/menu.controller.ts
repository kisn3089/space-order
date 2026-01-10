import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import type { Menu, Owner, PublicMenu } from '@spaceorder/db';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import {
  createMenuSchema,
  mergedStoreIdAndMenuIdParamsSchema,
  storeIdParamsSchema,
  updateMenuSchema,
} from '@spaceorder/auth';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import { Client } from 'src/decorators/client.decorator';
import { MenuPermission } from 'src/utils/guards/model-auth/menu-permission.guard';
import { CachedMenu } from 'src/decorators/cache/menu.cache';
import { MenuResponseDto } from './dto/menuResponse.dto';

export class CreateMenuDto extends createZodDto(createMenuSchema) {}
export class UpdateMenuDto extends createZodDto(updateMenuSchema) {}

@Controller('stores/:storeId/menus')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(
    ZodValidation({ params: storeIdParamsSchema, body: createMenuSchema }),
    MenuPermission,
  )
  async createMenu(
    @Param('storeId') storeId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return await this.menuService.createMenu(storeId, createMenuDto);
  }

  @Get()
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }), MenuPermission)
  async getMenuList(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
  ): Promise<PublicMenu[]> {
    return await this.menuService.getMenuList(client, storeId);
  }

  @Get(':menuId')
  @UseGuards(
    ZodValidation({ params: mergedStoreIdAndMenuIdParamsSchema }),
    MenuPermission,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  getMenuById(@CachedMenu() cachedMenu: Menu): MenuResponseDto {
    return new MenuResponseDto(cachedMenu);
  }

  @Patch(':menuId')
  @UseGuards(
    ZodValidation({
      params: mergedStoreIdAndMenuIdParamsSchema,
      body: updateMenuSchema,
    }),
    MenuPermission,
  )
  async updateMenu(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<PublicMenu> {
    return await this.menuService.updateMenu(menuId, updateMenuDto);
  }

  @Delete(':menuId')
  @UseGuards(
    ZodValidation({ params: mergedStoreIdAndMenuIdParamsSchema }),
    MenuPermission,
  )
  async deleteMenu(@Param('menuId') menuId: string): Promise<void> {
    await this.menuService.deleteMenu(menuId);
  }
}

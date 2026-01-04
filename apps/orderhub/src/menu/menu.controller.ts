import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import type { Owner, PublicMenu } from '@spaceorder/db';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import {
  createMenuSchema,
  mergedStoreIdAndMenuIdParamsSchema,
  storeIdParamsSchema,
  updateMenuSchema,
} from '@spaceorder/auth';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import { Client } from 'src/decorators/client.decorator';

export class CreateMenuDto extends createZodDto(createMenuSchema) {}
export class UpdateMenuDto extends createZodDto(updateMenuSchema) {}

@Controller('stores/:storeId/menus')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(
    ZodValidationGuard({ params: storeIdParamsSchema, body: createMenuSchema }),
  )
  async createMenu(
    @Client() client: Owner,
    @Param('storeId') storePublicId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return await this.menuService.createMenu({ storePublicId }, createMenuDto);
  }

  @Get()
  @UseGuards(ZodValidationGuard({ params: storeIdParamsSchema }))
  async getMenuList(
    @Client() client: Owner,
    @Param('storeId') storePublicId: string,
  ): Promise<PublicMenu[]> {
    return await this.menuService.getMenuList(client, { storePublicId });
  }

  @Get(':menuId')
  @UseGuards(ZodValidationGuard({ params: mergedStoreIdAndMenuIdParamsSchema }))
  async getMenuById(
    @Param('storeId') storePublicId: string,
    @Param('menuId') menuPublicId: string,
  ): Promise<PublicMenu> {
    return await this.menuService.txableGetMenuById()({
      storePublicId,
      menuPublicId,
    });
  }

  @Patch(':menuId')
  @UseGuards(
    ZodValidationGuard({
      params: mergedStoreIdAndMenuIdParamsSchema,
      body: updateMenuSchema,
    }),
  )
  async updateMenu(
    @Param('storeId') storePublicId: string,
    @Param('menuId') menuPublicId: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<PublicMenu> {
    return await this.menuService.updateMenu(
      { storePublicId, menuPublicId },
      updateMenuDto,
    );
  }

  @Delete(':menuId')
  @UseGuards(ZodValidationGuard({ params: mergedStoreIdAndMenuIdParamsSchema }))
  async deleteMenu(
    @Param('storeId') storePublicId: string,
    @Param('menuId') menuPublicId: string,
  ): Promise<void> {
    await this.menuService.deleteMenu({ storePublicId, menuPublicId });
  }
}

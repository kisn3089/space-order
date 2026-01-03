import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { PublicMenu } from '@spaceorder/db';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import {
  createMenuSchema,
  mergedStoreIdAndMenuIdParamsSchema,
  storeIdParamsSchema,
  updateMenuSchema,
} from '@spaceorder/auth';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';

export class CreateMenuDto extends createZodDto(createMenuSchema) {}
export class UpdateMenuDto extends createZodDto(updateMenuSchema) {}

@Controller('stores/:storeId/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, ZodValidationGuard({ params: storeIdParamsSchema }))
  async createMenu(
    @Param('storeId') storePublicId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return await this.menuService.createMenu(storePublicId, createMenuDto);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, ZodValidationGuard({ params: storeIdParamsSchema }))
  async getMenuList(
    @Param('storeId') storePublicId: string,
  ): Promise<PublicMenu[]> {
    return await this.menuService.getMenuList(storePublicId);
  }

  @Get(':menuId')
  @HttpCode(200)
  @UseGuards(
    JwtAuthGuard,
    ZodValidationGuard({ params: mergedStoreIdAndMenuIdParamsSchema }),
  )
  async findOne(
    @Param('storeId') storePublicId: string,
    @Param('menuId') menuPublicId: string,
  ): Promise<PublicMenu> {
    return await this.menuService.getMenuById(storePublicId, menuPublicId);
  }

  @Patch(':menuId')
  @HttpCode(200)
  @UseGuards(
    JwtAuthGuard,
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
      storePublicId,
      menuPublicId,
      updateMenuDto,
    );
  }

  @Delete(':menuId')
  @HttpCode(204)
  @UseGuards(
    JwtAuthGuard,
    ZodValidationGuard({ params: mergedStoreIdAndMenuIdParamsSchema }),
  )
  async deleteMenu(
    @Param('storeId') storePublicId: string,
    @Param('menuId') menuPublicId: string,
  ): Promise<void> {
    await this.menuService.deleteMenu(storePublicId, menuPublicId);
  }
}

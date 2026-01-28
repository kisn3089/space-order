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
import type { Menu, Owner, ResponseMenu } from '@spaceorder/db';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import { Client } from 'src/decorators/client.decorator';
import { MenuPermission } from 'src/utils/guards/model-permissions/menu-permission.guard';
import { CachedMenuByGuard } from 'src/decorators/cache/menu.decorator';
import { MenuResponseDto } from './dto/menuResponse.dto';
import {
  createMenuSchema,
  mergedStoreIdAndMenuIdParamsSchema,
  storeIdParamsSchema,
  updateMenuSchema,
} from '@spaceorder/api/schemas';

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
  async create(
    @Param('storeId') storeId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return await this.menuService.createMenu(storeId, createMenuDto);
  }

  @Get()
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }), MenuPermission)
  async getList(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
  ): Promise<ResponseMenu[]> {
    return await this.menuService.getMenuList({
      where: {
        store: { publicId: storeId, owner: { id: client.id } },
        deletedAt: null,
      },
      omit: this.menuService.menuOmit,
    });
  }

  @Get(':menuId')
  @UseGuards(
    ZodValidation({ params: mergedStoreIdAndMenuIdParamsSchema }),
    MenuPermission,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  getUnique(@CachedMenuByGuard() cachedMenu: Menu): MenuResponseDto {
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
  async partialUpdate(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<ResponseMenu> {
    return await this.menuService.partialUpdateMenu(menuId, updateMenuDto);
  }

  @Delete(':menuId')
  @UseGuards(
    ZodValidation({ params: mergedStoreIdAndMenuIdParamsSchema }),
    MenuPermission,
  )
  async delete(@Param('menuId') menuId: string): Promise<void> {
    await this.menuService.softDeleteMenu(menuId);
  }
}

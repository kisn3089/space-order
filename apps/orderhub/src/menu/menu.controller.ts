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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { menuDocs } from 'src/docs/menu.docs';
import { paramsDocs } from 'src/docs/params.docs';

export class CreateMenuDto extends createZodDto(createMenuSchema) {}
export class UpdateMenuDto extends createZodDto(updateMenuSchema) {}

@ApiTags('Menus')
@ApiBearerAuth()
@Controller('stores/:storeId/menus')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(
    ZodValidation({ params: storeIdParamsSchema, body: createMenuSchema }),
    MenuPermission,
  )
  @ApiOperation({ summary: menuDocs.create.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiBody({ type: CreateMenuDto })
  @ApiResponse({ ...menuDocs.create.successResponse, type: MenuResponseDto })
  @ApiResponse(menuDocs.badRequestResponse)
  @ApiResponse(menuDocs.unauthorizedResponse)
  async create(
    @Param('storeId') storeId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return await this.menuService.createMenu(storeId, createMenuDto);
  }

  @Get()
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }), MenuPermission)
  @ApiOperation({ summary: menuDocs.getList.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiResponse({ ...menuDocs.getList.successResponse, type: [MenuResponseDto] })
  @ApiResponse(menuDocs.unauthorizedResponse)
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
  @ApiOperation({ summary: menuDocs.getUnique.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.menuId)
  @ApiResponse({ ...menuDocs.getUnique.successResponse, type: MenuResponseDto })
  @ApiResponse(menuDocs.unauthorizedResponse)
  @ApiResponse(menuDocs.notFoundResponse)
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
  @ApiOperation({ summary: menuDocs.update.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.menuId)
  @ApiBody({ type: UpdateMenuDto })
  @ApiResponse({ ...menuDocs.update.successResponse, type: MenuResponseDto })
  @ApiResponse(menuDocs.badRequestResponse)
  @ApiResponse(menuDocs.unauthorizedResponse)
  @ApiResponse(menuDocs.notFoundResponse)
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
  @ApiOperation({ summary: menuDocs.delete.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.menuId)
  @ApiResponse(menuDocs.delete.successResponse)
  @ApiResponse(menuDocs.unauthorizedResponse)
  @ApiResponse(menuDocs.notFoundResponse)
  async delete(@Param('menuId') menuId: string): Promise<void> {
    await this.menuService.softDeleteMenu(menuId);
  }
}

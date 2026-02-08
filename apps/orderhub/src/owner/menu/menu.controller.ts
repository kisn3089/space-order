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
  HttpCode,
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
import type { Owner, PublicMenu } from '@spaceorder/db';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { Client } from 'src/decorators/client.decorator';
import { PublicMenuDto } from '../../dto/public/menu.dto';
import {
  createMenuPayloadSchema,
  storeIdAndMenuIdParamsSchema,
  storeIdParamsSchema,
  updateMenuPayloadSchema,
} from '@spaceorder/api/schemas';
import { menuDocs } from 'src/docs/menu.docs';
import { paramsDocs } from 'src/docs/params.docs';
import { CreateMenuPayloadDto, UpdateMenuPayloadDto } from 'src/dto/menu.dto';
import { OwnerStoreGuard } from 'src/utils/guards/owner-store.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Menus')
@ApiBearerAuth()
@Controller('stores/:storeId/menus')
@UseGuards(JwtAuthGuard, OwnerStoreGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(
    ZodValidation({
      params: storeIdParamsSchema,
      body: createMenuPayloadSchema,
    }),
  )
  @ApiOperation({ summary: menuDocs.create.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiBody({ type: CreateMenuPayloadDto })
  @ApiResponse({ ...menuDocs.create.successResponse, type: PublicMenuDto })
  @ApiResponse(menuDocs.badRequestResponse)
  @ApiResponse(menuDocs.unauthorizedResponse)
  async create(
    @Param('storeId') storeId: string,
    @Body() createMenuPayload: CreateMenuPayloadDto,
  ) {
    return await this.menuService.createMenu(storeId, createMenuPayload);
  }

  @Get()
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }))
  @ApiOperation({ summary: menuDocs.getList.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiResponse({ ...menuDocs.getList.successResponse, type: [PublicMenuDto] })
  @ApiResponse(menuDocs.unauthorizedResponse)
  async list(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
  ): Promise<PublicMenu[]> {
    return await this.menuService.getMenuList({
      where: {
        store: { publicId: storeId, owner: { id: client.id } },
        deletedAt: null,
      },
      omit: this.menuService.omitPrivate,
    });
  }

  @Get(':menuId')
  @UseGuards(ZodValidation({ params: storeIdAndMenuIdParamsSchema }))
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: menuDocs.getUnique.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.menuId)
  @ApiResponse({ ...menuDocs.getUnique.successResponse, type: PublicMenuDto })
  @ApiResponse(menuDocs.unauthorizedResponse)
  @ApiResponse(menuDocs.notFoundResponse)
  async unique(@Param('menuId') menuId: string): Promise<PublicMenuDto> {
    const findMenu = await this.menuService.getMenuUnique({
      where: { publicId: menuId },
      omit: this.menuService.omitPrivate,
    });

    return new PublicMenuDto(findMenu);
  }

  @Patch(':menuId')
  @UseGuards(
    ZodValidation({
      params: storeIdAndMenuIdParamsSchema,
      body: updateMenuPayloadSchema,
    }),
  )
  @ApiOperation({ summary: menuDocs.update.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.menuId)
  @ApiBody({ type: UpdateMenuPayloadDto })
  @ApiResponse({ ...menuDocs.update.successResponse, type: PublicMenuDto })
  @ApiResponse(menuDocs.badRequestResponse)
  @ApiResponse(menuDocs.unauthorizedResponse)
  @ApiResponse(menuDocs.notFoundResponse)
  async partialUpdate(
    @Param('menuId') menuId: string,
    @Body() updateMenuPayload: UpdateMenuPayloadDto,
  ): Promise<PublicMenu> {
    return await this.menuService.partialUpdateMenu(menuId, updateMenuPayload);
  }

  @Delete(':menuId')
  @HttpCode(204)
  @UseGuards(ZodValidation({ params: storeIdAndMenuIdParamsSchema }))
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

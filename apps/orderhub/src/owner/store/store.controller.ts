import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StoreService } from './store.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Client } from 'src/decorators/client.decorator';
import type { Owner, PublicStore } from '@spaceorder/db';
import { PublicStoreDto } from '../../dto/public/store.dto';
import { storeDocs } from 'src/docs/store.docs';
import { paramsDocs } from 'src/docs/params.docs';
import { OwnerStoreGuard } from 'src/utils/guards/model-permissions/owner-store.guard';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('stores')
@UseGuards(JwtAuthGuard, OwnerStoreGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @ApiOperation({ summary: storeDocs.create.summary })
  @ApiResponse(storeDocs.notImplementedResponse)
  create(): void {
    throw new NotImplementedException('This feature is not yet implemented');
  }

  @Get()
  @ApiOperation({ summary: storeDocs.getList.summary })
  @ApiResponse({
    ...storeDocs.getList.successResponse,
    type: [PublicStoreDto],
  })
  @ApiResponse(storeDocs.unauthorizedResponse)
  async list(@Client() client: Owner): Promise<PublicStore[]> {
    return await this.storeService.getStoreList({
      where: { ownerId: client.id },
      omit: this.storeService.omitPrivate,
    });
  }

  @Get(':storeId')
  @ApiOperation({ summary: storeDocs.getUnique.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiResponse({
    ...storeDocs.getUnique.successResponse,
    type: PublicStoreDto,
  })
  @ApiResponse(storeDocs.unauthorizedResponse)
  @ApiResponse(storeDocs.notFoundResponse)
  async unique(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
  ): Promise<PublicStore> {
    return await this.storeService.getStoreUnique({
      where: { publicId: storeId, ownerId: client.id },
      omit: this.storeService.omitPrivate,
    });
  }

  @Delete(':storeId')
  @ApiOperation({ summary: storeDocs.delete.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiResponse(storeDocs.notImplementedResponse)
  delete(): void {
    throw new NotImplementedException('This feature is not yet implemented');
  }
}

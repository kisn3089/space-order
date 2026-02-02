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
import type { Owner, ResponseStore } from '@spaceorder/db';
import {
  StoreResponseDto,
  SummarizedOrdersResponseDto,
} from './dto/storeResponse.dto';
import { storeDocs } from 'src/docs/store.docs';
import { paramsDocs } from 'src/docs/params.docs';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('stores')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @ApiOperation({ summary: storeDocs.create.summary })
  @ApiResponse(storeDocs.notImplementedResponse)
  createStore(): void {
    throw new NotImplementedException('This feature is not yet implemented');
  }

  @Get()
  @ApiOperation({ summary: storeDocs.getList.summary })
  @ApiResponse({
    ...storeDocs.getList.successResponse,
    type: [StoreResponseDto],
  })
  @ApiResponse(storeDocs.unauthorizedResponse)
  async getList(@Client() client: Owner): Promise<ResponseStore[]> {
    return await this.storeService.getStoreList({
      where: { ownerId: client.id },
      omit: this.storeService.storeOmit,
    });
  }

  /** 추후 지점이 2개 이상인 경우 로컬 스토리지를 통해 활성화된 storeId 값으로 변경한다. */
  @Get('order-summary')
  @ApiOperation({ summary: '매장 주문 요약 조회' })
  @ApiResponse({
    status: 200,
    description: '테이블별 주문 요약 정보 반환',
    type: SummarizedOrdersResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  async getOrderSummary(
    @Client() client: Owner,
  ): Promise<SummarizedOrdersResponseDto> {
    return new SummarizedOrdersResponseDto(
      await this.storeService.getOrderSummary(client),
    );
  }

  @Get(':storeId')
  @ApiOperation({ summary: storeDocs.getUnique.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiResponse({
    ...storeDocs.getUnique.successResponse,
    type: StoreResponseDto,
  })
  @ApiResponse(storeDocs.unauthorizedResponse)
  @ApiResponse(storeDocs.notFoundResponse)
  async getUnique(@Param('storeId') storeId: string): Promise<ResponseStore> {
    return await this.storeService.getStoreUnique({
      where: { publicId: storeId },
      omit: this.storeService.storeOmit,
    });
  }

  @Delete(':storeId')
  @ApiOperation({ summary: storeDocs.delete.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiResponse(storeDocs.notImplementedResponse)
  deleteStore(): void {
    throw new NotImplementedException('This feature is not yet implemented');
  }
}

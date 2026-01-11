import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { TableService } from './table.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import {
  createTableSchema,
  mergedStoreAndTableParamsSchema,
  storeIdParamsSchema,
  updateTableSchema,
} from '@spaceorder/auth';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type { PublicTable, TableAndStoreOwnerId } from '@spaceorder/db';
import { TablePermission } from 'src/utils/guards/model-auth/table-permission.guard';
import { CachedTableByGuard } from 'src/decorators/cache/table.cache';
import { TableResponseDto } from './dto/tableResponse.dto';

export class CreateTableDto extends createZodDto(createTableSchema) {}
export class UpdateTableDto extends createZodDto(updateTableSchema) {}

@Controller('stores/:storeId/tables')
@UseGuards(JwtAuthGuard)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @UseGuards(
    ZodValidation({
      params: storeIdParamsSchema,
      body: createTableSchema,
    }),
    TablePermission,
  )
  async createTable(
    @Param('storeId') storeId: string,
    @Body() createTableDto: CreateTableDto,
  ): Promise<PublicTable> {
    return await this.tableService.createTable(storeId, createTableDto);
  }

  @Get()
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }), TablePermission)
  async getTableList(
    @Param('storeId') storeId: string,
  ): Promise<PublicTable[]> {
    return await this.tableService.getTableList(storeId);
  }

  @Get(':tableId')
  @UseGuards(
    ZodValidation({ params: mergedStoreAndTableParamsSchema }),
    TablePermission,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  getTableById(
    /** TODO: idempotency를 Cache 데코레이터에 구현하여 L1 캐시로 사용해도 좋을듯? */
    @CachedTableByGuard() cachedTable: TableAndStoreOwnerId,
  ): TableResponseDto {
    return new TableResponseDto(cachedTable);
  }

  @Patch(':tableId')
  @UseGuards(
    ZodValidation({
      params: mergedStoreAndTableParamsSchema,
      body: updateTableSchema,
    }),
    TablePermission,
  )
  async updateTable(
    @Param('tableId') tableId: string,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<PublicTable> {
    return await this.tableService.updateTable(tableId, updateTableDto);
  }

  @Delete(':tableId')
  @UseGuards(
    ZodValidation({ params: mergedStoreAndTableParamsSchema }),
    TablePermission,
  )
  async deleteTable(@Param('tableId') tableId: string): Promise<void> {
    await this.tableService.deleteTable(tableId);
  }
}

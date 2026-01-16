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
  Query,
} from '@nestjs/common';
import { TableService } from './table.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import {
  createTableSchema,
  mergedStoreAndTableParamsSchema,
  storeIdParamsSchema,
  tableListQuerySchema,
  tableQuerySchema,
  updateTableSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type { ResponseTable, TableAndStoreOwnerId } from '@spaceorder/db';
import { TablePermission } from 'src/utils/guards/model-permissions/table-permission.guard';
import { CachedTableByGuard } from 'src/decorators/cache/table.decorator';
import { TableResponseDto } from './dto/tableResponse.dto';
import {
  TABLE_INCLUDE_KEY_RECORD,
  TABLE_OMIT,
  TABLE_SESSION_FILTER_RECORD,
} from './table-query.const';
import { BuildIncludeService } from 'src/utils/query-params/build-include';

type TableQueryParams = {
  include?: keyof typeof TABLE_INCLUDE_KEY_RECORD;
  filter?: keyof typeof TABLE_SESSION_FILTER_RECORD;
};

export class CreateTableDto extends createZodDto(createTableSchema) {}
export class UpdateTableDto extends createZodDto(updateTableSchema) {}
@Controller('stores/:storeId/tables')
@UseGuards(JwtAuthGuard)
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly buildInclude: BuildIncludeService,
  ) {}

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
  ): Promise<ResponseTable> {
    return await this.tableService.createTable(storeId, createTableDto);
  }

  @Get()
  @UseGuards(
    ZodValidation({ params: storeIdParamsSchema, query: tableListQuerySchema }),
    TablePermission,
  )
  async getTableList(
    @Param('storeId') storeId: string,
    @Query() query?: TableQueryParams,
  ): Promise<ResponseTable[]> {
    const { filter, include } = this.buildInclude.build({
      query,
      includeKeyRecord: TABLE_INCLUDE_KEY_RECORD,
      filterRecord: TABLE_SESSION_FILTER_RECORD,
    });

    return await this.tableService.getTableList({
      where: { store: { publicId: storeId }, ...filter },
      include: include,
      omit: TABLE_OMIT,
    });
  }

  @Get(':tableId')
  @UseGuards(
    ZodValidation({
      params: mergedStoreAndTableParamsSchema,
      query: tableQuerySchema,
    }),
    TablePermission,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  async getTableById(
    /** TODO: idempotency를 Cache 데코레이터에 구현하여 L1 캐시로 사용해도 좋을듯? */
    @CachedTableByGuard() cachedTable: TableAndStoreOwnerId,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Query() query?: TableQueryParams,
  ) {
    if (!query) {
      return new TableResponseDto(cachedTable);
    }

    const { filter, include } = this.buildInclude.build({
      query,
      includeKeyRecord: TABLE_INCLUDE_KEY_RECORD,
      filterRecord: TABLE_SESSION_FILTER_RECORD,
    });

    return await this.tableService.getTableById({
      where: { publicId: tableId, store: { publicId: storeId }, ...filter },
      include: include,
      omit: TABLE_OMIT,
    });
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
  ): Promise<ResponseTable> {
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

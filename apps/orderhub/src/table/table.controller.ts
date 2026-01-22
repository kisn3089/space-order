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
  tableUniqueQuerySchema,
  updateTableSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type {
  ExtendedResponseTable,
  ResponseTable,
  Table,
} from '@spaceorder/db';
import { TablePermission } from 'src/utils/guards/model-permissions/table-permission.guard';
import { CachedTableByGuard } from 'src/decorators/cache/table.decorator';
import { TableResponseDto } from './dto/tableResponse.dto';
import { TABLE_OMIT, TABLE_FILTER_RECORD } from './table-query.const';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';
import { SESSION_INCLUDE_RECORD } from 'src/table-session/table-session-query.const';

type TableQueryParams = {
  filter?: keyof typeof TABLE_FILTER_RECORD;
  include?: keyof typeof SESSION_INCLUDE_RECORD;
};

export class CreateTableDto extends createZodDto(createTableSchema) {}
export class UpdateTableDto extends createZodDto(updateTableSchema) {}
@Controller('stores/:storeId/tables')
@UseGuards(JwtAuthGuard)
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly queryParamsBuilder: QueryParamsBuilderService,
  ) {}

  @Post()
  @UseGuards(
    ZodValidation({
      params: storeIdParamsSchema,
      body: createTableSchema,
    }),
    TablePermission,
  )
  async create(
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
  async getList(
    @Param('storeId') storeId: string,
    @Query() query?: TableQueryParams,
  ): Promise<ExtendedResponseTable[]> {
    const { filter, include } = this.queryParamsBuilder.build({
      query,
      includeRecord: SESSION_INCLUDE_RECORD,
      filterRecord: TABLE_FILTER_RECORD,
    });

    const tableFilter = query?.filter === 'activated-table' ? filter : {};
    const includeSession =
      query?.filter !== 'activated-table'
        ? { tableSessions: { ...include, ...filter } }
        : {};

    return await this.tableService.getTableList({
      where: { store: { publicId: storeId }, ...tableFilter },
      include: includeSession,
      omit: TABLE_OMIT,
    });
  }

  @Get(':tableId')
  @UseGuards(
    ZodValidation({
      params: mergedStoreAndTableParamsSchema,
      query: tableUniqueQuerySchema,
    }),
    TablePermission,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  async getUnique(
    @CachedTableByGuard() cachedTable: Table,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Query() query?: TableQueryParams,
  ): Promise<TableResponseDto | ExtendedResponseTable> {
    if (!query || (!query.include && !query.filter)) {
      return new TableResponseDto(cachedTable);
    }

    const { include } = this.queryParamsBuilder.build({
      query,
      includeRecord: SESSION_INCLUDE_RECORD,
    });

    return await this.tableService.getTableUnique({
      where: { publicId: tableId, store: { publicId: storeId } },
      ...include,
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
  async partialUpdate(
    @Param('tableId') tableId: string,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<ResponseTable> {
    return await this.tableService.partialUpdateTable(tableId, updateTableDto);
  }

  @Delete(':tableId')
  @UseGuards(
    ZodValidation({ params: mergedStoreAndTableParamsSchema }),
    TablePermission,
  )
  async delete(@Param('tableId') tableId: string): Promise<void> {
    await this.tableService.deleteTable(tableId);
  }
}

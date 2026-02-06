import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Patch,
  Delete,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TableService } from './table.service';
import { tableDocs } from 'src/docs/table.docs';
import { paramsDocs } from 'src/docs/params.docs';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import {
  createTablePayloadSchema,
  storeIdAndTableIdParamsSchema,
  storeIdParamsSchema,
  tableListQuerySchema,
  updateTablePayloadSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type { ExtendedResponseTable, PublicTable } from '@spaceorder/db';
import { PublicTableDto } from '../../dto/public/table.dto';
import { TABLE_FILTER_RECORD } from '../../common/query/table-query.const';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';
import { SESSION_INCLUDE_RECORD } from 'src/common/query/session-query.const';
import {
  CreateTablePayloadDto,
  UpdateTablePayloadDto,
} from 'src/dto/table.dto';
import { OwnerStoreGuard } from 'src/utils/guards/model-permissions/owner-store.guard';

type ListQueryParams = {
  filter?: keyof typeof TABLE_FILTER_RECORD;
  include?: keyof typeof SESSION_INCLUDE_RECORD;
};

@ApiTags('Tables')
@ApiBearerAuth()
@Controller('stores/:storeId/tables')
@UseGuards(JwtAuthGuard, OwnerStoreGuard)
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly queryParamsBuilder: QueryParamsBuilderService,
  ) {}

  @Post()
  @UseGuards(
    ZodValidation({
      params: storeIdParamsSchema,
      body: createTablePayloadSchema,
    }),
  )
  @ApiOperation({ summary: tableDocs.create.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiBody({ type: CreateTablePayloadDto })
  @ApiResponse({
    ...tableDocs.create.successResponse,
    type: PublicTableDto,
  })
  @ApiResponse(tableDocs.badRequestResponse)
  @ApiResponse(tableDocs.unauthorizedResponse)
  async create(
    @Param('storeId') storeId: string,
    @Body() createTablePayload: CreateTablePayloadDto,
  ): Promise<PublicTable> {
    return await this.tableService.createTable(storeId, createTablePayload);
  }

  @Get()
  @UseGuards(
    ZodValidation({ params: storeIdParamsSchema, query: tableListQuerySchema }),
  )
  @ApiOperation({ summary: tableDocs.getList.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiQuery(paramsDocs.query.filter.table)
  @ApiQuery(paramsDocs.query.include.orderItems)
  @ApiResponse({
    ...tableDocs.getList.successResponse,
    type: [PublicTableDto],
  })
  @ApiResponse(tableDocs.unauthorizedResponse)
  async list(
    @Param('storeId') storeId: string,
    @Query() query?: ListQueryParams,
  ): Promise<ExtendedResponseTable[]> {
    const { filter, include } = this.queryParamsBuilder.build({
      query,
      includeRecord: SESSION_INCLUDE_RECORD,
      filterRecord: TABLE_FILTER_RECORD,
    });

    const tableFilter = query?.filter === 'activated-table' ? filter : {};
    const includeSession =
      query?.filter !== 'activated-table' && include
        ? { tableSessions: { ...(include ?? {}), ...(filter ?? {}) } }
        : {};

    return await this.tableService.getTableList({
      where: { store: { publicId: storeId }, ...tableFilter },
      include: includeSession,
      omit: this.tableService.omitPrivate,
    });
  }

  @Get(':tableId')
  @UseGuards(ZodValidation({ params: storeIdAndTableIdParamsSchema }))
  @ApiOperation({ summary: tableDocs.getUnique.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.tableId)
  @ApiQuery(paramsDocs.query.filter.table)
  @ApiQuery(paramsDocs.query.include.orderItems)
  @ApiResponse({
    ...tableDocs.getUnique.successResponse,
    type: PublicTableDto,
  })
  @ApiResponse(tableDocs.unauthorizedResponse)
  @ApiResponse(tableDocs.notFoundResponse)
  async unique(
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
  ): Promise<PublicTable> {
    return await this.tableService.getTableUnique({
      where: { publicId: tableId, store: { publicId: storeId } },
      omit: this.tableService.omitPrivate,
    });
  }

  @Patch(':tableId')
  @UseGuards(
    ZodValidation({
      params: storeIdAndTableIdParamsSchema,
      body: updateTablePayloadSchema,
    }),
  )
  @ApiOperation({ summary: tableDocs.update.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.tableId)
  @ApiBody({ type: UpdateTablePayloadDto })
  @ApiResponse({
    ...tableDocs.update.successResponse,
    type: PublicTableDto,
  })
  @ApiResponse(tableDocs.badRequestResponse)
  @ApiResponse(tableDocs.unauthorizedResponse)
  @ApiResponse(tableDocs.notFoundResponse)
  async partialUpdate(
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Body() updateTablePayload: UpdateTablePayloadDto,
  ): Promise<PublicTable> {
    return await this.tableService.partialUpdateTable(
      { storeId, tableId },
      updateTablePayload,
    );
  }

  @Delete(':tableId')
  @HttpCode(204)
  @UseGuards(ZodValidation({ params: storeIdAndTableIdParamsSchema }))
  @ApiOperation({ summary: tableDocs.delete.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.tableId)
  @ApiResponse(tableDocs.delete.successResponse)
  @ApiResponse(tableDocs.unauthorizedResponse)
  @ApiResponse(tableDocs.notFoundResponse)
  async delete(
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
  ): Promise<void> {
    await this.tableService.deleteTable({ storeId, tableId });
  }
}

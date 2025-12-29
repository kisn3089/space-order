import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Patch,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TableService } from './table.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import {
  createTableSchema,
  mergedStoreAndTableParamsSchema,
  storeParamsSchema,
  updateTableSchema,
} from '@spaceorder/auth';
import { TableResponseDto } from './dto/response-table.dto';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';

export class CreateTableDto extends createZodDto(createTableSchema) {}
export class UpdateTableDto extends createZodDto(updateTableSchema) {}

@Controller('stores/:storeId/tables')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(
    ZodValidationGuard({ params: storeParamsSchema, body: createTableSchema }),
  )
  async createTable(
    @Param('storeId') storePublicId: string,
    @Body() createTableDto: CreateTableDto,
  ) {
    const createdTable = await this.tableService.createTable(
      storePublicId,
      createTableDto,
    );
    return new TableResponseDto(createdTable);
  }

  @Get()
  @UseGuards(ZodValidationGuard({ params: storeParamsSchema }))
  async retrieveTableList(@Param('storeId') storePublicId: string) {
    const retrievedTableList =
      await this.tableService.retrieveTableList(storePublicId);
    return retrievedTableList.map((table) => new TableResponseDto(table));
  }

  @Get(':tableId')
  @UseGuards(ZodValidationGuard({ params: mergedStoreAndTableParamsSchema }))
  async retrieveTableById(@Param('tableId') tablePublicId: string) {
    const retrievedTable =
      await this.tableService.retrieveTableById(tablePublicId);

    if (!retrievedTable) {
      throw new HttpException(
        {
          code: 'TABLE_NOT_FOUND',
          message: '해당 table를 찾을 수 없습니다.',
          details: { tableId: tablePublicId },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return new TableResponseDto(retrievedTable);
  }

  @Patch(':tableId')
  @UseGuards(
    ZodValidationGuard({
      params: mergedStoreAndTableParamsSchema,
      body: updateTableSchema,
    }),
  )
  async updateTable(
    @Param('tableId') tablePublicId: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    const updatedTable = await this.tableService.updateTable(
      tablePublicId,
      updateTableDto,
    );
    return new TableResponseDto(updatedTable);
  }

  @Delete(':tableId')
  @HttpCode(204)
  @UseGuards(ZodValidationGuard({ params: mergedStoreAndTableParamsSchema }))
  async deleteTable(@Param('tableId') tablePublicId: string) {
    await this.tableService.deleteTable(tablePublicId);
  }
}

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
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { PublicTable } from '@spaceorder/db';

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
  ): Promise<PublicTable> {
    return await this.tableService.createTable(storePublicId, createTableDto);
  }

  @Get()
  @UseGuards(ZodValidationGuard({ params: storeParamsSchema }))
  async retrieveTableList(
    @Param('storeId') storePublicId: string,
  ): Promise<PublicTable[]> {
    return await this.tableService.getTableList(storePublicId);
  }

  @Get(':tableId')
  @UseGuards(ZodValidationGuard({ params: mergedStoreAndTableParamsSchema }))
  async retrieveTableById(
    @Param('tableId') tablePublicId: string,
  ): Promise<PublicTable> {
    return await this.tableService.getTableById(tablePublicId);
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
  ): Promise<PublicTable> {
    return await this.tableService.updateTable(tablePublicId, updateTableDto);
  }

  @Delete(':tableId')
  @HttpCode(204)
  @UseGuards(ZodValidationGuard({ params: mergedStoreAndTableParamsSchema }))
  async deleteTable(@Param('tableId') tablePublicId: string): Promise<void> {
    await this.tableService.deleteTable(tablePublicId);
  }
}

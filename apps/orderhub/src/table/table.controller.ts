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
  storeAndTableParamsSchema,
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
  @UseGuards(ZodValidationGuard({ params: storeParamsSchema }))
  async create(
    @Param('storeId') storePublicId: string,
    @Body() createTableDto: CreateTableDto,
  ) {
    const createdTable = await this.tableService.create(
      storePublicId,
      createTableDto,
    );
    return new TableResponseDto(createdTable);
  }

  @Get()
  @UseGuards(ZodValidationGuard({ params: storeParamsSchema }))
  async findAllTables(@Param('storeId') storePublicId: string) {
    const foundTables = await this.tableService.findAll(storePublicId);
    return foundTables.map((table) => new TableResponseDto(table));
  }

  @Get(':tableId')
  @UseGuards(ZodValidationGuard({ params: storeAndTableParamsSchema }))
  async findUniqueTable(@Param('tableId') tablePublicId: string) {
    const foundTable = await this.tableService.findUnique(tablePublicId);
    return new TableResponseDto(foundTable);
  }

  @Patch(':tableId')
  @UseGuards(
    ZodValidationGuard({
      params: storeAndTableParamsSchema,
      body: updateTableSchema,
    }),
  )
  async updateTable(
    @Param('tableId') tablePublicId: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    const updatedTable = await this.tableService.update(
      tablePublicId,
      updateTableDto,
    );
    return new TableResponseDto(updatedTable);
  }

  @Delete(':tableId')
  @HttpCode(204)
  @UseGuards(ZodValidationGuard({ params: storeAndTableParamsSchema }))
  async deleteTable(@Param('tableId') tablePublicId: string) {
    await this.tableService.delete(tablePublicId);
  }
}

import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { responseMessage } from 'src/common/constants/response-message';
import { createId } from '@paralleldrive/cuid2';
import { CreateTableDto, UpdateTableDto } from './table.controller';
import type { Table } from '@spaceorder/db';

@Injectable()
export class TableService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTable(
    storePublicId: string,
    createTableDto: CreateTableDto,
  ): Promise<Table> {
    const tablePublicId = createId();
    const qrCode = `/stores/${storePublicId}/tables/${tablePublicId}/session`;

    const createdTable = await this.prismaService.table.create({
      data: {
        ...createTableDto,
        publicId: tablePublicId,
        qrCode,
        seats: createTableDto.seats ?? 4,
        isActive: true,
        store: { connect: { publicId: storePublicId } },
      },
    });

    if (!createdTable) {
      console.warn('Failed to create table');
      throw new BadRequestException(responseMessage('invalidBody'));
    }

    return createdTable;
  }

  async retrieveTableList(storePublicId: string): Promise<Table[]> {
    const retrievedTableList = await this.prismaService.table.findMany({
      where: { store: { publicId: storePublicId } },
    });

    if (!retrievedTableList) {
      console.warn('Failed to find tables');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return retrievedTableList;
  }

  async retrieveTableById(tablePublicId: string): Promise<Table> {
    const retrievedTable = await this.prismaService.table.findUnique({
      where: { publicId: tablePublicId },
    });

    if (!retrievedTable) {
      console.warn('Failed to find table');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return retrievedTable;
  }

  async updateTable(
    tablePublicId: string,
    updateTableDto: UpdateTableDto,
  ): Promise<Table> {
    const updatedTable = await this.prismaService.table.update({
      where: { publicId: tablePublicId },
      data: { ...updateTableDto },
    });

    if (!updatedTable) {
      console.warn('Failed to update table');
      throw new BadRequestException(responseMessage('invalidBody'));
    }

    return updatedTable;
  }

  async deleteTable(tablePublicId: string): Promise<Table> {
    const deletedTable = await this.prismaService.table.delete({
      where: { publicId: tablePublicId },
    });

    if (!deletedTable) {
      console.warn('Failed to delete table');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return deletedTable;
  }
}

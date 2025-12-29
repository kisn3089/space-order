import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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

    return createdTable;
  }

  async retrieveTableList(storePublicId: string): Promise<Table[]> {
    const retrievedTableList = await this.prismaService.table.findMany({
      where: { store: { publicId: storePublicId } },
    });

    return retrievedTableList;
  }

  async retrieveTableById(tablePublicId: string): Promise<Table> {
    const retrievedTable = await this.prismaService.table.findUniqueOrThrow({
      where: { publicId: tablePublicId },
    });

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

    return updatedTable;
  }

  async deleteTable(tablePublicId: string): Promise<Table> {
    const deletedTable = await this.prismaService.table.delete({
      where: { publicId: tablePublicId },
    });

    return deletedTable;
  }
}

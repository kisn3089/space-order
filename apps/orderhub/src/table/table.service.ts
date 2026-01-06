import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { CreateTableDto, UpdateTableDto } from './table.controller';
import type { PublicTable } from '@spaceorder/db';

@Injectable()
export class TableService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly tableOmit = { id: true, storeId: true };

  async createTable(
    storeId: string,
    createTableDto: CreateTableDto,
  ): Promise<PublicTable> {
    const tablePublicId = createId();
    const qrCode = `/stores/${storeId}/tables/${tablePublicId}/session`;
    const createdTable = await this.prismaService.table.create({
      data: {
        ...createTableDto,
        publicId: tablePublicId,
        qrCode,
        seats: createTableDto.seats ?? 4,
        isActive: true,
        store: { connect: { publicId: storeId } },
      },
      omit: this.tableOmit,
    });
    return createdTable;
  }

  async getTableList(storeId: string): Promise<PublicTable[]> {
    return await this.prismaService.table.findMany({
      where: { store: { publicId: storeId } },
      omit: this.tableOmit,
    });
  }

  async getTableById(storeId: string, tableId: string): Promise<PublicTable> {
    return await this.prismaService.table.findFirstOrThrow({
      where: { publicId: tableId, store: { publicId: storeId } },
      omit: this.tableOmit,
    });
  }

  async updateTable(
    tableId: string,
    updateTableDto: UpdateTableDto,
  ): Promise<PublicTable> {
    return await this.prismaService.table.update({
      where: { publicId: tableId },
      data: updateTableDto,
      omit: this.tableOmit,
    });
  }

  async deleteTable(tableId: string): Promise<PublicTable> {
    return await this.prismaService.table.delete({
      where: { publicId: tableId },
      omit: this.tableOmit,
    });
  }
}

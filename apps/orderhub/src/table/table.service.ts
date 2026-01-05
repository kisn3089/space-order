import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { CreateTableDto, UpdateTableDto } from './table.controller';
import type { PublicTable } from '@spaceorder/db';

type StoreIdParams = { storeId: string };
type TableIdParams = { tableId: string };

@Injectable()
export class TableService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly tableOmit = { id: true, storeId: true };

  async createTable(
    { storeId: storePublicId }: StoreIdParams,
    createTableDto: CreateTableDto,
  ): Promise<PublicTable> {
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
      omit: this.tableOmit,
    });
    return createdTable;
  }

  async getTableList({
    storeId: storePublicId,
  }: StoreIdParams): Promise<PublicTable[]> {
    return await this.prismaService.table.findMany({
      where: { store: { publicId: storePublicId } },
      omit: this.tableOmit,
    });
  }

  async getTableById({
    storeId: storePublicId,
    tableId: tablePublicId,
  }: TableIdParams & StoreIdParams): Promise<PublicTable> {
    return await this.prismaService.table.findFirstOrThrow({
      where: { publicId: tablePublicId, store: { publicId: storePublicId } },
      omit: this.tableOmit,
    });
  }

  async updateTable(
    { tableId: tablePublicId }: TableIdParams,
    updateTableDto: UpdateTableDto,
  ): Promise<PublicTable> {
    return await this.prismaService.table.update({
      where: { publicId: tablePublicId },
      data: updateTableDto,
      omit: this.tableOmit,
    });
  }

  async deleteTable({
    tableId: tablePublicId,
  }: TableIdParams): Promise<PublicTable> {
    return await this.prismaService.table.delete({
      where: { publicId: tablePublicId },
      omit: this.tableOmit,
    });
  }
}

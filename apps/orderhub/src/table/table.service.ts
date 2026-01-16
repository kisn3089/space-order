import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { CreateTableDto, UpdateTableDto } from './table.controller';
import { type Prisma, type ResponseTable } from '@spaceorder/db';

type StoreAndTableParams = {
  storeId: string;
  tableId: string;
};
@Injectable()
export class TableService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly tableOmit = { id: true, storeId: true };

  async createTable(
    storeId: string,
    createTableDto: CreateTableDto,
  ): Promise<ResponseTable> {
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

  async getTableById({
    storeId,
    tableId,
  }: StoreAndTableParams): Promise<TableAndStoreOwnerId> {
    return await this.prismaService.table.findFirstOrThrow({
      where: { publicId: tableId, store: { publicId: storeId } },
      include: { store: { select: { ownerId: true } } },
    });
  }

  async updateTable(
    tableId: string,
    updateTableDto: UpdateTableDto,
  ): Promise<ResponseTable> {
    return await this.prismaService.table.update({
      where: { publicId: tableId },
      data: updateTableDto,
      omit: this.tableOmit,
    });
  }

  async deleteTable(tableId: string): Promise<ResponseTable> {
    return await this.prismaService.table.delete({
      where: { publicId: tableId },
      omit: this.tableOmit,
    });
  }
}

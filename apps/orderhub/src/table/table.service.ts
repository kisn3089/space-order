import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { CreateTableDto, UpdateTableDto } from './table.controller';
import type { PublicTable } from '@spaceorder/db';
import { Tx } from 'src/utils/helper/transactionPipe';

type TableBaseParams = { storePublicId: string };
type TableIdParams = { tablePublicId: string };

@Injectable()
export class TableService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly tableOmit = { id: true, storeId: true };

  async createTable(
    { storePublicId }: TableBaseParams,
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
    storePublicId,
  }: TableBaseParams): Promise<PublicTable[]> {
    return await this.prismaService.table.findMany({
      where: { store: { publicId: storePublicId } },
      omit: this.tableOmit,
    });
  }

  txableGetTableById(tx?: Tx) {
    const txableService = tx ?? this.prismaService;
    return async ({ tablePublicId }: TableIdParams): Promise<PublicTable> => {
      return await txableService.table.findFirstOrThrow({
        where: { publicId: tablePublicId },
        omit: this.tableOmit,
      });
    };
  }

  async updateTable(
    { tablePublicId }: TableIdParams,
    updateTableDto: UpdateTableDto,
  ): Promise<PublicTable> {
    return await this.prismaService.$transaction(async (tx) => {
      await this.txableGetTableById(tx)({ tablePublicId });

      return await tx.table.update({
        where: { publicId: tablePublicId },
        data: updateTableDto,
        omit: this.tableOmit,
      });
    });
  }

  async deleteTable({ tablePublicId }: TableIdParams): Promise<PublicTable> {
    return await this.prismaService.$transaction(async (tx) => {
      await this.txableGetTableById(tx)({ tablePublicId });

      return await tx.table.delete({
        where: { publicId: tablePublicId },
        omit: this.tableOmit,
      });
    });
  }
}

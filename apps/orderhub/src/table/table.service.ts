import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { CreateTableDto, UpdateTableDto } from './table.controller';
import { type Prisma, type ResponseTable } from '@spaceorder/db';
import { TABLE_OMIT } from './table-query.const';

@Injectable()
export class TableService {
  constructor(private readonly prismaService: PrismaService) {}

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
      omit: TABLE_OMIT,
    });
    return createdTable;
  }

  async getTableList<T extends Prisma.TableFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TableFindManyArgs>,
  ): Promise<Prisma.TableGetPayload<T>[]> {
    return await this.prismaService.table.findMany(args);
  }

  async getTableById<T extends Prisma.TableFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.TableFindFirstOrThrowArgs>,
  ): Promise<Prisma.TableGetPayload<T>> {
    return await this.prismaService.table.findFirstOrThrow(args);
  }

  async updateTable(
    tableId: string,
    updateTableDto: UpdateTableDto,
  ): Promise<ResponseTable> {
    return await this.prismaService.table.update({
      where: { publicId: tableId },
      data: updateTableDto,
      omit: TABLE_OMIT,
    });
  }

  async deleteTable(tableId: string): Promise<ResponseTable> {
    return await this.prismaService.table.delete({
      where: { publicId: tableId },
      omit: TABLE_OMIT,
    });
  }
}

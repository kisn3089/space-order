import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { CreateTableDto, UpdateTableDto } from './table.controller';
import type { PublicTable } from '@spaceorder/db';

@Injectable()
export class TableService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTable(
    storePublicId: string,
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
    });
    return createdTable;
  }

  async getTableList(storePublicId: string): Promise<PublicTable[]> {
    return await this.prismaService.table.findMany({
      where: { store: { publicId: storePublicId } },
    });
  }

  async getTableById(tablePublicId: string): Promise<PublicTable> {
    return await this.prismaService.table.findUniqueOrThrow({
      where: { publicId: tablePublicId },
    });
  }

  async updateTable(
    tablePublicId: string,
    updateTableDto: UpdateTableDto,
  ): Promise<PublicTable> {
    return await this.prismaService.table.update({
      where: { publicId: tablePublicId },
      data: { ...updateTableDto },
    });
  }

  async deleteTable(tablePublicId: string): Promise<PublicTable> {
    return await this.prismaService.table.delete({
      where: { publicId: tablePublicId },
    });
  }
}

import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { responseMessage } from 'src/common/constants/response-message';
import { createId } from '@paralleldrive/cuid2';
import { CreateTableDto, UpdateTableDto } from './table.controller';

@Injectable()
export class TableService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(storePublicId: string, createTableDto: CreateTableDto) {
    const createdTablePublicId = createId();
    const qrCode = `/stores/${storePublicId}/tables/${createdTablePublicId}/session`;

    const createdTable = await this.prismaService.table.create({
      data: {
        ...createTableDto,
        publicId: createdTablePublicId,
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

  async findAll(storePublicId: string) {
    const foundTables = await this.prismaService.table.findMany({
      where: { store: { publicId: storePublicId } },
    });

    if (!foundTables) {
      console.warn('Failed to find tables');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return foundTables;
  }

  async findUnique(tablePublicId: string) {
    const findRequestedTable = await this.prismaService.table.findUnique({
      where: { publicId: tablePublicId },
    });

    if (!findRequestedTable) {
      console.warn('Failed to find table');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return findRequestedTable;
  }

  async update(tablePublicId: string, updateTableDto: UpdateTableDto) {
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

  async delete(tablePublicId: string) {
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

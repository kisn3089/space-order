import { Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StoreService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createStoreDto: CreateStoreDto) {
    return 'This action adds a new store';
  }

  async findAll() {
    return await this.prismaService.store.findMany();
  }

  async findOne(publicId: string) {
    return await this.prismaService.store.findUnique({
      where: { publicId },
    });
  }

  update(id: number, updateStoreDto: UpdateStoreDto) {
    return `This action updates a #${id} store`;
  }

  remove(id: number) {
    return `This action removes a #${id} store`;
  }
}

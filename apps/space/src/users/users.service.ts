import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.prismaService.user.create({
      data: createUserDto,
    });
  }

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany({});
  }

  async findOne(id: number): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number): Promise<User> {
    return await this.prismaService.user.delete({
      where: { id },
    });
  }
}

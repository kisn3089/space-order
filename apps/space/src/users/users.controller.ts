import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpCode,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get() // GET /users or /users?role=value
  findAll(@Query('role') role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    return this.usersService.findAll(role);
  }

  @Get('me')
  findMe() {
    return this.usersService.findMe();
  }

  @Get(':id') // GET /users/:id
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post() // POST /users
  @HttpCode(207)
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @Patch(':id') // PATCH /users/:id
  @HttpCode(209)
  update(@Param('id') id: string, @Body() userUpdate: Partial<CreateUserDto>) {
    return this.usersService.update(id, userUpdate);
  }

  @Delete(':id') // DELETE /users/:id
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}

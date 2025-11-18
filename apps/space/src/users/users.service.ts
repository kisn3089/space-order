import { Body, Injectable, Param, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

const users = [
  { id: 1, name: 'John Doe', role: 'ENGINEER' },
  { id: 2, name: 'Jane Smith', role: 'INTERN' },
];

@Injectable()
export class UsersService {
  findAll(@Query('role') role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    const filteredUsers = role
      ? users.filter((user) => user.role === role)
      : users;
    return filteredUsers;
  }

  findMe() {
    return users[0];
  }

  findOne(@Param('id') id: string) {
    const findedUser = users.find((user) => user.id === Number(id));
    if (!findedUser) {
      return { message: 'User not found' };
    }

    return findedUser;
  }

  create(@Body() user: CreateUserDto) {
    console.log('user: ', user);

    users.push(user);
    return user;
  }

  update(@Param('id') id: string, @Body() userUpdate: Partial<CreateUserDto>) {
    const findUpdateUser = users.find((user) => user.id === Number(id));
    if (!findUpdateUser) {
      return { message: 'User not found' };
    }
    Object.assign(findUpdateUser, userUpdate);

    return findUpdateUser;
  }

  delete(@Param('id') id: string) {
    const userIndex = users.findIndex((user) => user.id === Number(id));
    if (userIndex === -1) {
      return { message: 'User not found' };
    }
    users.splice(userIndex, 1);
    return { message: `User with id ${id} deleted` };
  }
}

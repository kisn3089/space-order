import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum UserRole {
  INTERN = 'INTERN',
  ENGINEER = 'ENGINEER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserRole, {
    message: 'role must be one of: INTERN, ENGINEER, ADMIN',
  })
  role: UserRole;
}

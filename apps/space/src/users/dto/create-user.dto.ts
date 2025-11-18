import { IsString, IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator';

export enum UserRole {
  INTERN = 'INTERN',
  ENGINEER = 'ENGINEER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsNumber()
  @Min(1)
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserRole, {
    message: 'role must be one of: INTERN, ENGINEER, ADMIN',
  })
  role: UserRole;
}

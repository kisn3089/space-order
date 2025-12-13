import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';

// Role은 배열로 관리 필요 (migration needs) - seed.ts 파일 수정 필요
enum AdminRole {
  SUPER = 'SUPER',
  SUPPORT = 'SUPPORT',
  VIEWER = 'VIEWER',
}

export class CreateAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

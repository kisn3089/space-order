import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ description: '관리자 이메일', example: 'admin@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '비밀번호 (최소 8자, 소문자 1개, 숫자 1개, 특수문자 1개 포함)',
    example: 'password1!',
  })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({ description: '관리자 이름', example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '관리자 권한', enum: AdminRole })
  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;

  @ApiPropertyOptional({ description: '활성화 여부', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

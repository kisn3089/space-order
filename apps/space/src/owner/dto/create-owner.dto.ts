import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateOwnerDto {
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

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  businessNumber: string;

  @IsBoolean()
  isVerified: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

import { Owner } from '@spaceorder/db/client';
import { Exclude, Expose } from 'class-transformer';

export class OwnerResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  businessNumber: string;

  @Expose()
  isVerified: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  lastLoginAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  id: number;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  constructor(partial: Partial<Owner>) {
    Object.assign(this, partial);
  }
}

import { Admin, AdminRole } from '@spaceorder/db';
import { Exclude, Expose } from 'class-transformer';

export class AdminResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: AdminRole;

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

  constructor(partial: Partial<Admin>) {
    Object.assign(this, partial);
  }
}

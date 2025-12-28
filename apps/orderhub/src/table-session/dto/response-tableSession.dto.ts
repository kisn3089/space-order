import { TableSessionStatus } from '@spaceorder/db';
import { Exclude, Expose } from 'class-transformer';

export class TableSessionResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  status: TableSessionStatus;

  @Expose()
  sessionToken: string;

  @Expose()
  activatedAt: Date;

  @Expose()
  expiresAt: Date;

  @Expose()
  totalAmount: number;

  @Expose()
  paidAmount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  closedAt: Date | null;

  @Exclude()
  id: bigint;

  @Exclude()
  storeId: bigint;

  @Exclude()
  tableId: bigint;

  constructor(partial: Partial<TableSessionResponseDto>) {
    Object.assign(this, partial);
  }
}

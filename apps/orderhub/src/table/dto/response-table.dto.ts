import type { Order, Store, Table, TableSession } from '@spaceorder/db';
import { Exclude, Expose } from 'class-transformer';

export class TableResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  tableNumber: number;

  @Expose()
  name?: string;

  @Expose()
  seats: number;

  @Expose()
  floor?: number;

  @Expose()
  section?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  qrCode: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  orders: Order[];

  @Expose()
  tableSessions: TableSession[];

  @Exclude()
  id: bigint;

  @Exclude()
  storeId: bigint;

  @Exclude()
  store: Store;

  constructor(partial: Partial<Table>) {
    Object.assign(this, partial);
  }
}

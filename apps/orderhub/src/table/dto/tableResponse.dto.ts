import type { Order, Store, Table, TableSession } from '@spaceorder/db';
import { Exclude, Expose } from 'class-transformer';

export class TableResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  tableNumber: number;

  @Expose()
  name: string;

  @Expose()
  seats: number;

  @Expose()
  floor: number;

  @Expose()
  section: string;

  @Expose()
  isActive: boolean;

  @Expose()
  qrCode: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  id: bigint;

  @Exclude()
  storeId: bigint;

  @Exclude()
  store: Store;

  @Exclude()
  orders: Order[];

  @Exclude()
  tableSessions: TableSession[];

  constructor(partial: Partial<Table>) {
    Object.assign(this, partial);
  }
}

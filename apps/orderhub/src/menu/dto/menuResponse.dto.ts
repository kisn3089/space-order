import type { Menu, OrderItem, Store } from '@spaceorder/db';
import { Exclude, Expose } from 'class-transformer';

export class MenuResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string;

  @Expose()
  isAvailable: boolean;

  @Expose()
  category: string;

  @Expose()
  sortOrder: number;

  @Expose()
  requiredOptions: object;

  @Expose()
  customOptions: object;

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
  orderItems: OrderItem[];

  constructor(partial: Partial<Menu>) {
    Object.assign(this, partial);
  }
}

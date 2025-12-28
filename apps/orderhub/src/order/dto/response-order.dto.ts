import { Order, OrderItem, OrderStatus } from '@spaceorder/db';
import { Exclude, Expose } from 'class-transformer';

export class OrderResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  storeId: string;

  @Expose()
  tableId: string;

  @Expose()
  status: OrderStatus;

  @Expose()
  totalPrice: number;

  @Expose()
  memo?: string;

  @Expose()
  cancelledReason?: string;

  @Expose()
  orderedAt: Date;

  @Expose()
  acceptedAt?: Date;

  @Expose()
  completedAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  orderItems: OrderItem[];

  @Exclude()
  id: bigint;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }
}

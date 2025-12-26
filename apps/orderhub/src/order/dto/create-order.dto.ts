import { OrderItem } from '@spaceorder/db';

type PublicOrderItem = Omit<OrderItem, 'menuId'> & { menuPublicId: string };

export class CreateOrderDto {
  orderItems: PublicOrderItem[];
}

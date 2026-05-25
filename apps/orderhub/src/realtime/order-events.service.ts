import { Injectable, Logger } from "@nestjs/common";
import { OrderRealtimeEvent } from "@spaceorder/db";
import { REALTIME_EVENT, realtimeRoom } from "./realtime.constants";
import { RealtimeGateway } from "./realtime.gateway";

type BroadcastTarget = {
  storePublicId: string;
  tablePublicId: string;
};

@Injectable()
export class OrderEventsService {
  private readonly logger = new Logger(OrderEventsService.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  emitOrderCreated(
    target: BroadcastTarget,
    notice?: OrderRealtimeEvent["notice"]
  ): void {
    this.broadcast(REALTIME_EVENT.ORDER_CREATED, target, { notice });
  }

  emitOrderUpdated(
    target: BroadcastTarget,
    notice?: OrderRealtimeEvent["notice"]
  ): void {
    this.broadcast(REALTIME_EVENT.ORDER_UPDATED, target, { notice });
  }

  emitOrderCancelled(
    target: BroadcastTarget,
    notice?: OrderRealtimeEvent["notice"]
  ): void {
    this.broadcast(REALTIME_EVENT.ORDER_CANCELLED, target, { notice });
  }

  private broadcast(
    event: string,
    { storePublicId, tablePublicId }: BroadcastTarget,
    payload: OrderRealtimeEvent
  ): void {
    const { server } = this.gateway;
    const adminsRoom = realtimeRoom.admins(storePublicId);
    const tableRoom = realtimeRoom.table(storePublicId, tablePublicId);
    server.to(adminsRoom).emit(event, payload);
    server.to(tableRoom).emit(event, payload);
    this.logger.log(`emit ${event} → ${adminsRoom}, ${tableRoom}`);
  }
}

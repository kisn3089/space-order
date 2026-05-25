"use client";

import { useEffect } from "react";
import {
  getRealtimeSocket,
  REALTIME_EVENT,
  subscribeAdmin,
  unsubscribeAdmin,
} from "./socket";
import { OrderRealtimeEvent } from "@spaceorder/db/types";

export type StoreRealtimeHandlers = {
  onCreatedAction?: (event: OrderRealtimeEvent) => void;
  onUpdatedAction?: (event: OrderRealtimeEvent) => void;
  onCancelledAction?: (event: OrderRealtimeEvent) => void;
};

export const useStoreOrderRealtimeDaemon = (
  storeId: string | undefined,
  handlers: StoreRealtimeHandlers
): void => {
  const { onCreatedAction, onUpdatedAction, onCancelledAction } = handlers;

  useEffect(() => {
    if (!storeId) return;

    const socket = getRealtimeSocket();
    subscribeAdmin(storeId);

    if (onCreatedAction)
      socket.on(REALTIME_EVENT.ORDER_CREATED, onCreatedAction);
    if (onUpdatedAction)
      socket.on(REALTIME_EVENT.ORDER_UPDATED, onUpdatedAction);
    if (onCancelledAction)
      socket.on(REALTIME_EVENT.ORDER_CANCELLED, onCancelledAction);

    return () => {
      if (onCreatedAction)
        socket.off(REALTIME_EVENT.ORDER_CREATED, onCreatedAction);
      if (onUpdatedAction)
        socket.off(REALTIME_EVENT.ORDER_UPDATED, onUpdatedAction);
      if (onCancelledAction)
        socket.off(REALTIME_EVENT.ORDER_CANCELLED, onCancelledAction);
      unsubscribeAdmin(storeId);
    };
  }, [storeId, onCreatedAction, onUpdatedAction, onCancelledAction]);
};

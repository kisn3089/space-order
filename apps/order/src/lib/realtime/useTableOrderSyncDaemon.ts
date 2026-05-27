"use client";

import { useEffect } from "react";
import { getRealtimeSocket, REALTIME_EVENT } from "./socket";
import { OrderSyncEvent } from "@spaceorder/db/types";

export type UseTableOrderSyncDaemon = {
  onCreatedAction?: (event: OrderSyncEvent) => void;
  onUpdatedAction?: (event: OrderSyncEvent) => void;
  onCancelledAction?: (event: OrderSyncEvent) => void;
};

export const useTableOrderSyncDaemon = (
  handlers: UseTableOrderSyncDaemon
): void => {
  const { onCreatedAction, onUpdatedAction, onCancelledAction } = handlers;

  useEffect(() => {
    const socket = getRealtimeSocket();
    if (!socket.connected) socket.connect();

    if (onCreatedAction) {
      socket.on(REALTIME_EVENT.ORDER_CREATED, onCreatedAction);
    }

    if (onUpdatedAction) {
      socket.on(REALTIME_EVENT.ORDER_UPDATED, onUpdatedAction);
      socket.on(REALTIME_EVENT.ORDER_ITEM_UPDATED, onUpdatedAction);
    }

    if (onCancelledAction) {
      socket.on(REALTIME_EVENT.ORDER_CANCELLED, onCancelledAction);
      socket.on(REALTIME_EVENT.ORDER_ITEM_DELETED, onCancelledAction);
    }

    return () => {
      if (onCreatedAction) {
        socket.off(REALTIME_EVENT.ORDER_CREATED, onCreatedAction);
      }

      if (onUpdatedAction) {
        socket.off(REALTIME_EVENT.ORDER_UPDATED, onUpdatedAction);
        socket.off(REALTIME_EVENT.ORDER_ITEM_UPDATED, onUpdatedAction);
      }

      if (onCancelledAction) {
        socket.off(REALTIME_EVENT.ORDER_CANCELLED, onCancelledAction);
        socket.off(REALTIME_EVENT.ORDER_ITEM_DELETED, onCancelledAction);
      }
    };
  }, [onCreatedAction, onUpdatedAction, onCancelledAction]);
};

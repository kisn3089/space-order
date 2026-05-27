"use client";

import { useEffect } from "react";
import { getRealtimeSocket, REALTIME_EVENT } from "./socket";
import { CartSyncEvent } from "@spaceorder/db/types";

export type UseCartSyncDaemon = {
  onCreated?: (event: CartSyncEvent) => void;
  onUpdated?: (event: CartSyncEvent) => void;
  onDeleted?: (event: CartSyncEvent) => void;
  onCleared?: (event: CartSyncEvent) => void;
};

export const useCartSyncDaemon = (handlers: UseCartSyncDaemon): void => {
  const { onCreated, onUpdated, onDeleted, onCleared } = handlers;

  useEffect(() => {
    const socket = getRealtimeSocket();
    if (!socket.connected) socket.connect();

    if (onCreated) socket.on(REALTIME_EVENT.CART_CREATED, onCreated);
    if (onUpdated) socket.on(REALTIME_EVENT.CART_UPDATED, onUpdated);
    if (onDeleted) socket.on(REALTIME_EVENT.CART_DELETED, onDeleted);
    if (onCleared) socket.on(REALTIME_EVENT.CART_CLEARED, onCleared);

    return () => {
      if (onCreated) socket.off(REALTIME_EVENT.CART_CREATED, onCreated);
      if (onUpdated) socket.off(REALTIME_EVENT.CART_UPDATED, onUpdated);
      if (onDeleted) socket.off(REALTIME_EVENT.CART_DELETED, onDeleted);
      if (onCleared) socket.off(REALTIME_EVENT.CART_CLEARED, onCleared);
    };
  }, [onCreated, onUpdated, onDeleted, onCleared]);
};

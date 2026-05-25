import { io, Socket } from "socket.io-client";

const REALTIME_URL = `${process.env.NEXT_PUBLIC_ORDERHUB_URL ?? "http://localhost:8080"}/events`;
const REALTIME_PATH = "/ws/";

export const REALTIME_EVENT = {
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  SUBSCRIBE_ADMIN: "subscribe:admin",
  UNSUBSCRIBE_ADMIN: "unsubscribe:admin",
} as const;

let socket: Socket | null = null;
const adminSubscriberCounts = new Map<string, number>();

const ensureSocket = (): Socket => {
  if (socket) return socket;
  const s = io(REALTIME_URL, {
    path: REALTIME_PATH,
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket"],
  });
  s.on("connect", () => {
    for (const [storeId, count] of adminSubscriberCounts) {
      if (count > 0) s.emit(REALTIME_EVENT.SUBSCRIBE_ADMIN, { storeId });
    }
  });
  socket = s;
  return s;
};

export const getRealtimeSocket = (): Socket => ensureSocket();

export const subscribeAdmin = (storeId: string): void => {
  const next = (adminSubscriberCounts.get(storeId) ?? 0) + 1;
  adminSubscriberCounts.set(storeId, next);
  if (next === 1) {
    const s = ensureSocket();
    if (!s.connected) s.connect();
    else s.emit(REALTIME_EVENT.SUBSCRIBE_ADMIN, { storeId });
  }
};

export const unsubscribeAdmin = (storeId: string): void => {
  const next = (adminSubscriberCounts.get(storeId) ?? 0) - 1;
  if (next <= 0) {
    adminSubscriberCounts.delete(storeId);
    if (socket?.connected) {
      socket.emit(REALTIME_EVENT.UNSUBSCRIBE_ADMIN, { storeId });
    }
  } else {
    adminSubscriberCounts.set(storeId, next);
  }
};

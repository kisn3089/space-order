import { http, resolveOrderhubBaseURL } from "@spaceorder/api";
import { io, Socket } from "socket.io-client";

const REALTIME_URL = `${resolveOrderhubBaseURL()}/events`;
const REALTIME_PATH = "/ws/";

let socket: Socket | null = null;
let socketIdInterceptorInstalled = false;

export const getRealtimeSocket = (): Socket => {
  if (socket) return socket;
  socket = io(REALTIME_URL, {
    path: REALTIME_PATH,
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket"],
  });
  installSocketIdInterceptor();
  return socket;
};

function installSocketIdInterceptor(): void {
  if (socketIdInterceptorInstalled) return;
  socketIdInterceptorInstalled = true;
  http.interceptors.request.use((config) => {
    const id = socket?.id;
    if (id) config.headers.set("X-Socket-Id", id);
    return config;
  });
}

export const REALTIME_EVENT = {
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_ITEM_UPDATED: "order.item.updated",
  ORDER_ITEM_DELETED: "order.item.deleted",
  CART_CREATED: "cart.created",
  CART_UPDATED: "cart.updated",
  CART_DELETED: "cart.deleted",
  CART_CLEARED: "cart.cleared",
} as const;

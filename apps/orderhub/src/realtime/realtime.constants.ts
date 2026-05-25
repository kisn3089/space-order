export const REALTIME_NAMESPACE = "/events";
export const REALTIME_PATH = "/ws/";

export const REALTIME_ORIGIN_KIND: Record<string, "admin" | "customer"> = {
  "http://localhost:3000": "customer",
  "http://localhost:3001": "admin",
};

export const REALTIME_CORS_ORIGINS = Object.keys(REALTIME_ORIGIN_KIND);

export const REALTIME_EVENT = {
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  SUBSCRIBE_ADMIN: "subscribe:admin",
  UNSUBSCRIBE_ADMIN: "unsubscribe:admin",
} as const;

export const realtimeRoom = {
  admins: (storePublicId: string) => `store:${storePublicId}:admins`,
  table: (storePublicId: string, tablePublicId: string) =>
    `store:${storePublicId}:table:${tablePublicId}`,
};

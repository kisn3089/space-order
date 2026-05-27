import { ConfigService } from "@nestjs/config";

export type MetaInfo<Meta = unknown> = unknown extends Meta
  ? { meta?: Meta }
  : { meta: Meta };

export const REALTIME_NAMESPACE = "/events";
export const REALTIME_PATH = "/ws/";

export type OriginKind = "admin" | "customer";

export const getRealtimeOriginKindMap = (
  config: ConfigService
): Record<string, OriginKind> => ({
  [config.getOrThrow<string>("ORDER_APP_URL")]: "customer",
  [config.getOrThrow<string>("ORDERDESK_APP_URL")]: "admin",
});

export const getRealtimeCorsOrigins = (config: ConfigService): string[] => [
  config.getOrThrow<string>("ORDER_APP_URL"),
  config.getOrThrow<string>("ORDERDESK_APP_URL"),
];

export const REALTIME_EVENT = {
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_ITEM_UPDATED: "order.item.updated",
  ORDER_ITEM_DELETED: "order.item.deleted",
  SUBSCRIBE_ADMIN: "subscribe:admin",
  UNSUBSCRIBE_ADMIN: "unsubscribe:admin",
  CART_CREATED: "cart.created",
  CART_UPDATED: "cart.updated",
  CART_DELETED: "cart.deleted",
  CART_CLEARED: "cart.cleared",
} as const;

export const realtimeRoom = {
  admins: (storePublicId: string) => `store:${storePublicId}:admins`,
  table: (storePublicId: string, tablePublicId: string) =>
    `store:${storePublicId}:table:${tablePublicId}`,
};

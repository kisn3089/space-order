import {
  ACTIVATED_TABLE,
  ALIVE_SESSION,
  ENDED_SESSION,
} from "./tableSessionQuery.const";

export const TABLE_QUERY_FILTER_CONST = {
  ALIVE_SESSION,
  ENDED_SESSION,
  ACTIVATED_TABLE,
} as const;

const ORDERS = "orders" as const;
const ORDER_ITEMS = "order-items" as const;

export const TABLE_QUERY_INCLUDE_CONST = {
  ORDERS,
  ORDER_ITEMS,
} as const;

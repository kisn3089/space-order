export const ALIVE_SESSION = "alive-session" as const;
export const ENDED_SESSION = "ended-session" as const;
export const ACTIVATED_TABLE = "activated-table" as const;

export const SESSION_QUERY_FILTER_KEYS = {
  ALIVE_SESSION,
  ENDED_SESSION,
  ACTIVATED_TABLE,
} as const;

const ORDERS = "orders" as const;
const ORDER_ITEMS = "order-items" as const;

export const SESSION_QUERY_INCLUDE_KEYS = {
  ORDERS,
  ORDER_ITEMS,
} as const;

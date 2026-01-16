const ALIVE_SESSION = "alive-session" as const;
const ENDED_SESSION = "ended-session" as const;
const ACTIVED_TABLE = "actived-table" as const;

export const TABLE_QUERY_FILTER_CONST = {
  ALIVE_SESSION,
  ENDED_SESSION,
  ACTIVED_TABLE,
} as const;

const ORDERS = "orders" as const;
const ORDER_ITEMS = "order-items" as const;

export const TABLE_QUERY_INCLUDE_CONST = {
  ORDERS,
  ORDER_ITEMS,
} as const;

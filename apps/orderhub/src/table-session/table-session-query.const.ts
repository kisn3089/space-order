import {
  SESSION_QUERY_FILTER_KEYS,
  SESSION_QUERY_INCLUDE_KEYS,
  TableSessionStatus,
} from '@spaceorder/db';

const aliveSessionFilter = () => ({
  status: {
    in: [TableSessionStatus.ACTIVE, TableSessionStatus.WAITING_ORDER],
  },
  expiresAt: { gt: new Date() },
});

export const endedSessionFilter = () => ({
  OR: [
    { status: TableSessionStatus.CLOSED },
    { expiresAt: { lt: new Date() } },
  ],
});

export const SESSION_FILTER_RECORD = {
  [SESSION_QUERY_FILTER_KEYS.ALIVE_SESSION]: aliveSessionFilter,
  [SESSION_QUERY_FILTER_KEYS.ENDED_SESSION]: endedSessionFilter,
} as const;

const ordersOmit = {
  id: true,
  storeId: true,
  tableId: true,
  tableSessionId: true,
} as const;
const ORDERS_RECORD = {
  include: { orders: { omit: ordersOmit } },
  omit: { id: true, tableId: true },
} as const;
const ORDER_ITEMS_RECORD = {
  include: {
    orders: {
      omit: ordersOmit,
      include: {
        orderItems: { omit: { id: true, orderId: true, menuId: true } },
      },
    },
  },
  omit: { id: true, tableId: true },
} as const;

export const SESSION_INCLUDE_KEY_RECORD = {
  [SESSION_QUERY_INCLUDE_KEYS.ORDERS]: ORDERS_RECORD,
  [SESSION_QUERY_INCLUDE_KEYS.ORDER_ITEMS]: ORDER_ITEMS_RECORD,
} as const;

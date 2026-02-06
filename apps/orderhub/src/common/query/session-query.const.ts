import {
  SESSION_QUERY_FILTER_KEYS,
  SESSION_QUERY_INCLUDE_KEYS,
  TableSessionStatus,
} from '@spaceorder/db';

/** Statuses */
export const ALIVE_SESSION_STATUSES = [
  TableSessionStatus.ACTIVE,
  TableSessionStatus.WAITING_ORDER,
];

/** Expires */
export const TWO_HOURS = () => new Date(Date.now() + 2 * 60 * 60 * 1000);
export const TWENTY_MINUTE = () => new Date(Date.now() + 20 * 60 * 1000);
export const ONE_HOURS = (expiresAt: Date) =>
  new Date(expiresAt.getTime() + 60 * 60 * 1000);

/** Omit */
const ORDERS_OMIT = {
  id: true,
  storeId: true,
  tableId: true,
  tableSessionId: true,
} as const;

export const SESSION_OMIT = { id: true, tableId: true } as const;

/** Include */
export const INCLUDE_TABLE = { table: true } as const;
export const INCLUDE_TABLE_STORE_MENUS = {
  table: { include: { store: { include: { menus: true } } } },
} as const;

/** Query Record */
const ORDERS_RECORD = {
  include: { orders: { omit: ORDERS_OMIT } },
  omit: SESSION_OMIT,
} as const;

const ORDER_ITEMS_RECORD = {
  include: {
    orders: {
      omit: ORDERS_OMIT,
      include: {
        orderItems: { omit: { id: true, orderId: true, menuId: true } },
      },
    },
  },
  omit: SESSION_OMIT,
} as const;

/** Query filter */
const aliveSessionFilter = () => ({
  where: {
    status: { in: ALIVE_SESSION_STATUSES },
    expiresAt: { gt: new Date() },
  },
  take: 1,
  orderBy: { createdAt: 'desc' as const },
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

export const SESSION_INCLUDE_RECORD = {
  [SESSION_QUERY_INCLUDE_KEYS.ORDERS]: ORDERS_RECORD,
  [SESSION_QUERY_INCLUDE_KEYS.ORDER_ITEMS]: ORDER_ITEMS_RECORD,
} as const;

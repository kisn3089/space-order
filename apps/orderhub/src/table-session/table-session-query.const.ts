import {
  SESSION_QUERY_FILTER_CONST,
  SESSION_QUERY_INCLUDE_CONST,
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
  [SESSION_QUERY_FILTER_CONST.ALIVE_SESSION]: aliveSessionFilter,
  [SESSION_QUERY_FILTER_CONST.ENDED_SESSION]: endedSessionFilter,
} as const;

const ordersOmit = {
  id: true,
  storeId: true,
  tableId: true,
  tableSessionId: true,
} as const;
export const SESSION_INCLUDE_KEY_RECORD = {
  [SESSION_QUERY_INCLUDE_CONST.ORDERS]: {
    include: { orders: { omit: ordersOmit } },
    omit: { id: true, tableId: true },
  },
  [SESSION_QUERY_INCLUDE_CONST.ORDER_ITEMS]: {
    include: {
      orders: {
        omit: ordersOmit,
        include: {
          orderItems: { omit: { id: true, orderId: true, menuId: true } },
        },
      },
    },
    omit: { id: true, tableId: true },
  },
} as const;

import {
  TABLE_QUERY_FILTER_CONST,
  TABLE_QUERY_INCLUDE_CONST,
  TableSessionStatus,
} from '@spaceorder/db';

export const TABLE_OMIT = { id: true, storeId: true } as const;

const aliveSession = {
  where: {
    status: {
      in: [TableSessionStatus.ACTIVE, TableSessionStatus.WAITING_ORDER],
    },
    expiresAt: { gt: new Date() },
  },
  take: 1,
  orderBy: { createdAt: 'desc' as const },
};

const endedSession = {
  where: { status: TableSessionStatus.CLOSED },
  omit: { id: true, tableId: true },
};

export const TABLE_SESSION_FILTER_RECORD = {
  [TABLE_QUERY_FILTER_CONST.ALIVE_SESSION]: aliveSession,
  [TABLE_QUERY_FILTER_CONST.ENDED_SESSION]: endedSession,
  [TABLE_QUERY_FILTER_CONST.ACTIVED_TABLE]: { isActive: true },
} as const;

const ordersOmit = {
  id: true,
  storeId: true,
  tableId: true,
  tableSessionId: true,
} as const;
export const TABLE_INCLUDE_KEY_RECORD = {
  [TABLE_QUERY_INCLUDE_CONST.ORDERS]: {
    tableSessions: {
      include: { orders: { omit: ordersOmit } },
      omit: { id: true, tableId: true },
    },
  },
  [TABLE_QUERY_INCLUDE_CONST.ORDER_ITEMS]: {
    tableSessions: {
      include: {
        orders: {
          omit: ordersOmit,
          include: {
            orderItems: { omit: { id: true, orderId: true, menuId: true } },
          },
        },
      },
    },
  },
} as const;

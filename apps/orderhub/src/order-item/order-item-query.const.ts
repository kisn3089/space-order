import {
  ORDER_ITEM_QUERY_FILTER_KEYS,
  TableSessionStatus,
} from '@spaceorder/db';

const createOrderItemAliveSessionFilter = () => ({
  tableSession: {
    status: TableSessionStatus.ACTIVE,
    expiresAt: { gt: new Date() },
  },
});

export const ORDER_ITEM_FILTER_RECORD = {
  [ORDER_ITEM_QUERY_FILTER_KEYS.ALIVE_SESSION]:
    createOrderItemAliveSessionFilter,
} as const;

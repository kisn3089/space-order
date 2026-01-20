import {
  ORDER_ITEM_QUERY_FILTER_CONST,
  TableSessionStatus,
} from '@spaceorder/db';

const createAliveSessionFilter = () => ({
  tableSession: {
    status: TableSessionStatus.ACTIVE,
    expiresAt: { gt: new Date() },
  },
});

export const ORDER_ITEM_FILTER_RECORD = {
  [ORDER_ITEM_QUERY_FILTER_CONST.ALIVE_SESSION]: createAliveSessionFilter,
} as const;

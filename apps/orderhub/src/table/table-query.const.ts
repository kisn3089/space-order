import { SESSION_QUERY_FILTER_CONST, TableSessionStatus } from '@spaceorder/db';
import { endedSessionFilter } from 'src/table-session/table-session-query.const';

const createAliveSessionFilter = () => ({
  where: {
    status: {
      in: [TableSessionStatus.ACTIVE, TableSessionStatus.WAITING_ORDER],
    },
    expiresAt: { gt: new Date() },
  },
  take: 1,
  orderBy: { createdAt: 'desc' as const },
});

const endedTableFilter = () => ({ where: endedSessionFilter() });

export const TABLE_OMIT = { id: true, storeId: true } as const;

export const TABLE_FILTER_RECORD = {
  [SESSION_QUERY_FILTER_CONST.ALIVE_SESSION]: createAliveSessionFilter,
  [SESSION_QUERY_FILTER_CONST.ENDED_SESSION]: endedTableFilter,
  [SESSION_QUERY_FILTER_CONST.ACTIVATED_TABLE]: () => ({ isActive: true }),
} as const;

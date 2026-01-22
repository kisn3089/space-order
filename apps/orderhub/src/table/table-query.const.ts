import { SESSION_QUERY_FILTER_KEYS, TableSessionStatus } from '@spaceorder/db';
import { endedSessionFilter } from 'src/table-session/table-session-query.const';

const aliveRecentSessionFilter = () => ({
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
  [SESSION_QUERY_FILTER_KEYS.ALIVE_SESSION]: aliveRecentSessionFilter,
  [SESSION_QUERY_FILTER_KEYS.ENDED_SESSION]: endedTableFilter,
  [SESSION_QUERY_FILTER_KEYS.ACTIVATED_TABLE]: () => ({ isActive: true }),
} as const;

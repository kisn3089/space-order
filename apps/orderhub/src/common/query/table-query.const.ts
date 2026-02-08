import { SESSION_QUERY_FILTER_KEYS } from '@spaceorder/db';

export const TABLE_OMIT = { id: true, storeId: true } as const;

export const TABLE_FILTER_RECORD = {
  [SESSION_QUERY_FILTER_KEYS.ACTIVATED_TABLE]: () => ({ isActive: true }),
} as const;

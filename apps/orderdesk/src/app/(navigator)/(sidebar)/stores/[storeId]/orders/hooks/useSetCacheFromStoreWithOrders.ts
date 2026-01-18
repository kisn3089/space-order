import {
  ResponseOrderWithItem,
  ResponseStore,
  ResponseStoreWithTables,
  ResponseTableWithSessions,
  TABLE_QUERY_FILTER_CONST,
  TABLE_QUERY_INCLUDE_CONST,
} from "@spaceorder/db";
import { useQueryClient } from "@tanstack/react-query";

const { ALIVE_SESSION } = TABLE_QUERY_FILTER_CONST;
const { ORDER_ITEMS } = TABLE_QUERY_INCLUDE_CONST;

export const useSetCacheFromStoreWithOrders = () => {
  const queryClient = useQueryClient();

  const setData = (storeWithTables: ResponseStoreWithTables) => {
    const { tables, ...store } = storeWithTables;

    queryClient.setQueryData<ResponseStore>(
      [`/stores/${store.publicId}`],
      store
    );

    const tablesWithAliveSessions = tables.map((tableWithSessions) => {
      const { tableSessions, ...table } = tableWithSessions;

      queryClient.setQueryData<ResponseTableWithSessions>(
        [
          `/stores/${store.publicId}/tables/${table.publicId}?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`,
        ],
        tableWithSessions
      );

      if (tableSessions && tableSessions[0]) {
        /**
         * TODO: orders의 기본 조회가 모든 orders로 변경되고 query(alive)에 따라 활성화된 테이블 세션의 orders를 조회한다면
         * 캐시 url 설정도 변경 필요 &filter=alive 같은 식으로
         */

        queryClient.setQueryData<ResponseOrderWithItem[]>(
          [`/owner/stores/${store.publicId}/tables/${table.publicId}/orders`],
          tableSessions[0].orders
        );

        tableSessions[0].orders?.forEach((order) => {
          queryClient.setQueryData<ResponseOrderWithItem>(
            [
              `/owner/stores/${store.publicId}/tables/${table.publicId}/orders/${order.publicId}`,
            ],
            order
          );
        });
      }

      return tableWithSessions;
    });

    queryClient.setQueryData<ResponseTableWithSessions[]>(
      [
        `/stores/${store.publicId}/tables?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`,
      ],
      tablesWithAliveSessions
    );
  };

  return setData;
};

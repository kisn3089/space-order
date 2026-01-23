import {
  ALIVE_SESSION,
  ORDER_ITEMS,
  ResponseStore,
  SummarizedOrdersFromStore,
  SummarizedTableWithSessions,
  SummarizedOrderWithItem,
} from "@spaceorder/db";
import { useQueryClient } from "@tanstack/react-query";

export const useSetCacheFromStoreWithOrders = () => {
  const queryClient = useQueryClient();

  const setData = (storeWithTables: SummarizedOrdersFromStore) => {
    const { tables, ...store } = storeWithTables;

    queryClient.setQueryData<ResponseStore>(
      [`/stores/${store.publicId}`],
      store
    );

    const tablesWithAliveSessions = tables.map((tableWithSessions) => {
      if (!tableWithSessions?.tableSessions) {
        return tableWithSessions;
      }

      const { tableSessions, ...table } = tableWithSessions;
      queryClient.setQueryData<SummarizedTableWithSessions>(
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

        queryClient.setQueryData<SummarizedOrderWithItem[]>(
          [`/owner/stores/${store.publicId}/tables/${table.publicId}/orders`],
          tableSessions[0].orders
        );

        tableSessions[0].orders?.forEach((order) => {
          queryClient.setQueryData<SummarizedOrderWithItem>(
            [
              `/owner/stores/${store.publicId}/tables/${table.publicId}/orders/${order.publicId}`,
            ],
            order
          );
        });
      }

      return tableWithSessions;
    });

    queryClient.setQueryData<SummarizedTableWithSessions[]>(
      [
        `/stores/${store.publicId}/tables?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`,
      ],
      tablesWithAliveSessions
    );
  };

  return setData;
};

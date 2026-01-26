import {
  ALIVE_SESSION,
  ORDER_ITEMS,
  ResponseStore,
  SummarizedOrdersFromStore,
  SummarizedTableWithSessions,
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

    queryClient.setQueryData<SummarizedTableWithSessions[]>(
      [
        `/stores/${store.publicId}/tables?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`,
      ],
      tables
    );
  };

  return setData;
};

import {
  LAST_ACCESSED_STORE_ID,
  PublicTable,
  SummarizedOrdersByStore,
} from "@spaceorder/db";
import { useQueryClient } from "@tanstack/react-query";

export const useSetCacheByStoreBoard = () => {
  const queryClient = useQueryClient();

  const setCache = (tableBoard: SummarizedOrdersByStore, storeId?: string) => {
    const lastAccessedStoreId = localStorage.getItem(LAST_ACCESSED_STORE_ID);

    tableBoard.forEach((tableWithSessinos) => {
      const { tableSessions: _, ...table } = tableWithSessinos;

      queryClient.setQueryData<PublicTable>(
        [
          `/owner/v1/stores/${storeId ?? lastAccessedStoreId}/tables/${table.publicId}`,
        ],
        table
      );
    });
  };

  const setStoreInLocalStorage = (storeId: string) => {
    localStorage.setItem(LAST_ACCESSED_STORE_ID, storeId);
  };

  return { setCache, setStoreInLocalStorage };
};

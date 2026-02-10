import {
  LAST_ACCESSED_STORE_ID,
  PublicTable,
  SummarizedOrdersByStore,
} from "@spaceorder/db";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const useSetCacheByStoreBoard = () => {
  const params = useParams<{ storeId: string }>();
  const queryClient = useQueryClient();

  const setCache = (tableBoard: SummarizedOrdersByStore, storeId?: string) => {
    tableBoard.forEach((tableWithSessinos) => {
      const { tableSessions: _, ...table } = tableWithSessinos;

      queryClient.setQueryData<PublicTable>(
        [`/stores/v1/${storeId ?? params.storeId}/tables/${table.publicId}`],
        table
      );
    });
  };

  const setStoreInLocalStorage = (storeId: string) => {
    localStorage.setItem(LAST_ACCESSED_STORE_ID, storeId);
  };

  return { setCache, setStoreInLocalStorage };
};

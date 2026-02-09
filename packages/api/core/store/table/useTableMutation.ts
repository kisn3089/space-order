import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpTables, UpdateTableParams } from "./httpTable";
import { LAST_ACCESSED_STORE_ID } from "@spaceorder/db/constants/localStorage.const";

export default function useTableMutation() {
  const queryClient = useQueryClient();
  const updateTable = useMutation({
    mutationFn: async (args: UpdateTableParams) => {
      return await httpTables.fetchUpdate(args);
    },
    onSuccess: () => {
      const lastAccessedStoreId = localStorage.getItem(LAST_ACCESSED_STORE_ID);
      queryClient.invalidateQueries({
        queryKey: [`/stores/v1/${lastAccessedStoreId}/tables`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/orders/v1/stores/${lastAccessedStoreId}/orders/summary`],
      });
    },
  });

  return { updateTable };
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpTables, UpdateTableParams } from "./httpTables";
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
        queryKey: [`/owner/v1/stores/${lastAccessedStoreId}/tables`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/owner/v1/stores/${lastAccessedStoreId}/orders/board`],
      });
    },
  });

  return { updateTable };
}

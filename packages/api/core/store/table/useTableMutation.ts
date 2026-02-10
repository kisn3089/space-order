import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpTables, UpdateTableParams } from "./httpTable";

export default function useTableMutation(storeId: string) {
  const queryClient = useQueryClient();
  const updateTable = useMutation({
    mutationFn: async (args: UpdateTableParams) => {
      return await httpTables.fetchUpdate(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/stores/v1/${storeId}/tables`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/orders/v1/stores/${storeId}/orders/summary`],
      });
    },
  });

  return { updateTable };
}

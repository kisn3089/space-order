import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpTables, UpdateTableParams } from "./httpTable";
import { pathToQueryKey } from "../../../utils/pathToQueryKey";

export default function useTableMutation(storeId: string) {
  const queryClient = useQueryClient();
  const updateTable = useMutation({
    mutationFn: async (args: UpdateTableParams) => {
      return await httpTables.fetchUpdate(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pathToQueryKey(`/stores/v1/${storeId}/tables`),
      });
      queryClient.invalidateQueries({
        queryKey: pathToQueryKey(`/orders/v1/stores/${storeId}/orders/summary`),
      });
    },
  });

  return { updateTable };
}

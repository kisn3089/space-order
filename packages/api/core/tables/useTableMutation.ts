import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpTables, UpdateTableParams } from "./httpTables";

export default function useTableMutation() {
  const queryClient = useQueryClient();
  const updateTable = useMutation({
    mutationFn: async ({
      storeId,
      tableId,
      updateTable,
    }: UpdateTableParams) => {
      return await httpTables.fetchUpdate({ storeId, tableId, updateTable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  return { updateTable };
}

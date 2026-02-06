import { PublicTable } from "@spaceorder/db";
import { http } from "../axios/http";
import { UpdateTable } from "../../schemas";

function prefix(storeId: string) {
  return `/stores/${storeId}/tables`;
}

export type FetchTableListParams = { storeId: string };
async function fetchList({
  storeId,
}: FetchTableListParams): Promise<PublicTable[]> {
  const response = await http.get<PublicTable[]>(prefix(storeId));
  return response.data;
}

export type FetchTableUniqueParams = { tableId: string } & FetchTableListParams;
async function fetchUnique({
  tableId,
  storeId,
}: FetchTableUniqueParams): Promise<PublicTable> {
  const response = await http.get<PublicTable>(`${prefix(storeId)}/${tableId}`);
  return response.data;
}

export type UpdateTableParams = {
  tableId: string;
  updateTable: UpdateTable;
  accessToken?: string;
} & FetchTableListParams;
async function fetchUpdate({
  tableId,
  storeId,
  updateTable,
  accessToken,
}: UpdateTableParams): Promise<PublicTable> {
  const response = await http.patch<PublicTable>(
    `${prefix(storeId)}/${tableId}`,
    updateTable,
    {
      ...(accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : {}),
    }
  );
  return response.data;
}

export const httpTables = { fetchList, fetchUnique, fetchUpdate };

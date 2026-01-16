import { ResponseTable } from "@spaceorder/db";
import { http } from "../axios/http";

export type FetchTableListParams = { storeId: string };
async function fetchList({
  storeId,
}: FetchTableListParams): Promise<ResponseTable[]> {
  const response = await http.get<PublicTable[]>(`/stores/${storeId}/tables`);
  return response.data;
}

export type FetchTableUniqueParams = { tableId: string } & FetchTableListParams;
async function fetchUnique({
  tableId,
  storeId,
}: FetchTableUniqueParams): Promise<PublicTable> {
  const response = await http.get<PublicTable>(
    `/stores/${storeId}/tables/${tableId}`
  );
  return response.data;
}

export const httpTables = { fetchList, fetchUnique };

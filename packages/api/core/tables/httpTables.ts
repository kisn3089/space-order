import { ResponseTable } from "@spaceorder/db";
import { http } from "../axios/http";
import { UpdateTable } from "../../schemas";

function prefix(storeId: string) {
  return `/stores/${storeId}/tables`;
}

export type FetchTableListParams = { storeId: string };
async function fetchList({
  storeId,
}: FetchTableListParams): Promise<ResponseTable[]> {
  const response = await http.get<ResponseTable[]>(prefix(storeId));
  return response.data;
}

export type FetchTableUniqueParams = { tableId: string } & FetchTableListParams;
async function fetchUnique({
  tableId,
  storeId,
}: FetchTableUniqueParams): Promise<ResponseTable> {
  const response = await http.get<ResponseTable>(
    `${prefix(storeId)}/${tableId}`
  );
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
}: UpdateTableParams): Promise<ResponseTable> {
  const response = await http.patch<ResponseTable>(
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

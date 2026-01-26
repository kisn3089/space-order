import { ResponseStore, SummarizedOrdersFromStore } from "@spaceorder/db";
import { http } from "../axios/http";

async function fetchList(): Promise<ResponseStore[]> {
  const response = await http.get<ResponseStore[]>("/stores");
  return response.data;
}

async function fetchUnique(publicId: string): Promise<ResponseStore> {
  const response = await http.get<ResponseStore>(`/stores/${publicId}`);
  return response.data;
}

async function fetchOrderSummary(): Promise<SummarizedOrdersFromStore> {
  const response =
    await http.get<SummarizedOrdersFromStore>(`/stores/alive-orders`);
  return response.data;
}

export const httpStores = {
  fetchList,
  fetchUnique,
  fetchOrderSummary,
};

import { PublicStore } from "@spaceorder/db";
import { http } from "../axios/http";

async function fetchList(): Promise<PublicStore[]> {
  const response = await http.get<PublicStore[]>("/stores");
  return response.data;
}

async function fetchUnique(publicId: string): Promise<PublicStore> {
  const response = await http.get<PublicStore>(`/stores/${publicId}`);
  return response.data;
}

export const httpStores = { fetchList, fetchUnique };

import { PublicStore } from "@spaceorder/db";
import { http } from "../axios/http";

const prefix = `/owner/v1/stores`;

async function fetchList(): Promise<PublicStore[]> {
  const response = await http.get<PublicStore[]>(`${prefix}`);
  return response.data;
}

async function fetchUnique(publicId: string): Promise<PublicStore> {
  const response = await http.get<PublicStore>(`${prefix}/${publicId}`);
  return response.data;
}

export const httpStores = {
  fetchList,
  fetchUnique,
};

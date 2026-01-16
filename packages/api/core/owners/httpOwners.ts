import { ResponseOwner } from "@spaceorder/db";
import { http } from "../axios/http";

async function fetchList(): Promise<ResponseOwner[]> {
  const response = await http.get<ResponseOwner[]>("/owners");
  return response.data;
}

async function fetchUnique(publicId: string): Promise<ResponseOwner> {
  const response = await http.get<ResponseOwner>(`/owners/${publicId}`);
  return response.data;
}

export const httpOwners = { fetchList, fetchUnique };

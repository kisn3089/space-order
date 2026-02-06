import { PublicOwner } from "@spaceorder/db";
import { http } from "../axios/http";

async function fetchList(): Promise<PublicOwner[]> {
  const response = await http.get<PublicOwner[]>("/owners");
  return response.data;
}

async function fetchUnique(publicId: string): Promise<PublicOwner> {
  const response = await http.get<PublicOwner>(`/owners/${publicId}`);
  return response.data;
}

export const httpOwners = { fetchList, fetchUnique };

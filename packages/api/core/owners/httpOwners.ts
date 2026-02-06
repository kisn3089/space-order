import { PublicOwner } from "@spaceorder/db";
import { http } from "../axios/http";

const prefix = "/owner/v1/owners";

async function fetchList(): Promise<PublicOwner[]> {
  const response = await http.get<PublicOwner[]>(`${prefix}`);
  return response.data;
}

async function fetchUnique(publicId: string): Promise<PublicOwner> {
  const response = await http.get<PublicOwner>(`${prefix}/${publicId}`);
  return response.data;
}

export const httpOwners = { fetchList, fetchUnique };

import { PublicOwner } from "@spaceorder/db";
import { http } from "../axios/http";

async function findAll(): Promise<PublicOwner[]> {
  const response = await http.get<PublicOwner[]>("/owners");
  return response.data;
}

async function findOne(publicId: string): Promise<PublicOwner> {
  const response = await http.get<PublicOwner>(`/owners/${publicId}`);
  return response.data;
}

export const httpOwners = { findAll, findOne };

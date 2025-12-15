import { PlainOwner } from "@spaceorder/db";
import { http } from "../axios/http";

async function findAll(): Promise<PlainOwner[]> {
  const response = await http.get<PlainOwner[]>("/owners");
  return response.data;
}

async function findOne(publicId: string): Promise<PlainOwner> {
  const response = await http.get<PlainOwner>(`/owners/${publicId}`);
  return response.data;
}

export const httpOwners = { findAll, findOne };

import { PublicAdmin } from "@spaceorder/db";
import { http } from "../../axios";

const prefix = "/identity/v1/admins";

async function fetchList() {
  const response = await http.get<PublicAdmin[]>(`${prefix}`);
  return response.data;
}

async function fetchUnique(publicId: string) {
  const response = await http.get<PublicAdmin>(`${prefix}/${publicId}`);
  return response.data;
}

export const httpAdmin = { fetchList, fetchUnique };

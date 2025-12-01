import { http } from "../http";

async function getAdminList() {
  const response = await http.get("/admin");
  return response.data;
}

export const httpAdmin = { getAdminList };

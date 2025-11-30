import { http } from "./http";

async function admins() {
  return await http.get("/admin");
}

export const httpAdmin = { admins };

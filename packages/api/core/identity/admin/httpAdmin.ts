import { http } from "../../axios";

const prefix = "/identity/v1/admins";

async function findAll() {
  const response = await http.get(`${prefix}`);
  return response.data;
}

async function findOne(publicId: string) {
  const response = await http.get(`${prefix}/${publicId}`);
  return response.data;
}

export const httpAdmin = { findAll, findOne };

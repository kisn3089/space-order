import { http } from "../axios/http";

// async function create() {
//   const response = await http.post("/admin", {

//   });
//   return response.data;
// }

async function findAll() {
  const response = await http.get("/owners");
  return response.data;
}

async function findOne(publicId: string) {
  const response = await http.get(`/owners/${publicId}`);
  return response.data;
}

export const httpOwners = { findAll, findOne };

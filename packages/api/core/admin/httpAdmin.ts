import { http } from "../http";

// async function create() {
//   const response = await http.post("/admin", {

//   });
//   return response.data;
// }

async function findAll() {
  const response = await http.get("/admin");
  return response.data;
}

async function findOne(publicId: string) {
  const response = await http.get(`/admin/${publicId}`);
  return response.data;
}

export const httpAdmin = { findAll, findOne };

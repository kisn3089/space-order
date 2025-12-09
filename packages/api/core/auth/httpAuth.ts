import { http } from "../http";
import { SignInRequest } from "./auth.type";

async function signIn({ email, password }: SignInRequest) {
  const response = await http.post("/auth/signin", {
    email,
    password,
  });
  return response.data;
}

export const httpAuth = { signIn };

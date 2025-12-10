import { http } from "../http";
import { SignInRequest, SignInResponse } from "./auth.type";
import { AxiosResponse } from "axios";

async function signIn({
  email,
  password,
}: SignInRequest): Promise<AxiosResponse<SignInResponse>> {
  const response = await http.post<SignInResponse>("/auth/signin", {
    email,
    password,
  });

  return response;
}

// [TODO:] refreshToken 구현 추가

export const httpAuth = { signIn };

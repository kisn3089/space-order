import { AxiosResponse } from "axios";
import { http } from "../axios/http";
import { AccessToken, SignInRequest, SignInResponse } from "./token.type";

const prefix = "/token";

async function createAccessToken({
  email,
  password,
}: SignInRequest): Promise<AxiosResponse<SignInResponse>> {
  const response = await http.post<SignInResponse>(`${prefix}`, {
    email,
    password,
  });
  return response;
}

async function refreshAccessToken(): Promise<AxiosResponse<AccessToken>> {
  // withCredentials: true로 인해 브라우저가 자동으로 HttpOnly 쿠키(Refresh)를 전송
  const response = await http.post<AccessToken>(`${prefix}/refresh`);
  return response;
}

export const httpToken = { createAccessToken, refreshAccessToken };

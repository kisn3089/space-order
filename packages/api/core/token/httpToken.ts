import { http } from "../axios/http";
import { AccessToken, SignInRequest, SignInResponse } from "./token.type";
import { AxiosResponse } from "axios";

const prefix = "/auth";

async function signIn({
  email,
  password,
}: SignInRequest): Promise<AxiosResponse<SignInResponse>> {
  return await http.post<SignInResponse>(`${prefix}/signin`, {
    email,
    password,
  });
}

type RefreshAccessTokenHeaders = { cookie: string };
async function refreshAccessToken({
  cookie,
}: RefreshAccessTokenHeaders): Promise<AxiosResponse<AccessToken>> {
  const refreshHeader = `Refresh=${cookie}`;
  return await http.post<AccessToken>(
    `${prefix}/refresh`,
    {},
    {
      headers: { Cookie: refreshHeader },
    }
  );
}

export const httpToken = { signIn, refreshAccessToken };

import { AxiosResponse } from "axios";
import { http } from "../axios/http";
import { ResponseAccessToken, SignInRequest } from "./token.type";
import { COOKIE_TABLE } from "@spaceorder/db";

const prefix = "/token";

async function createAccessToken({
  email,
  password,
}: SignInRequest): Promise<AxiosResponse<ResponseAccessToken>> {
  const response = await http.post<ResponseAccessToken>(`${prefix}`, {
    email,
    password,
  });
  return response;
}

async function refreshAccessToken(
  refreshToken?: string
): Promise<AxiosResponse<ResponseAccessToken>> {
  const response = await http.post<ResponseAccessToken>(
    `${prefix}/refresh`,
    {},
    refreshToken
      ? {
          headers: {
            Cookie: `${COOKIE_TABLE.REFRESH}=${refreshToken}`,
          },
        }
      : {}
  );
  return response;
}

export const httpToken = { createAccessToken, refreshAccessToken };

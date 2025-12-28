import { AxiosResponse } from "axios";
import { http } from "../axios/http";
import { AccessToken, SignInRequest } from "./token.type";
import { COOKIE_TABLE } from "@spaceorder/db";

const prefix = "/token";

async function createAccessToken({
  email,
  password,
}: SignInRequest): Promise<AxiosResponse<AccessToken>> {
  const response = await http.post<AccessToken>(`${prefix}`, {
    email,
    password,
  });
  return response;
}

async function refreshAccessToken(
  refreshToken?: string
): Promise<AxiosResponse<AccessToken>> {
  const response = await http.post<AccessToken>(
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

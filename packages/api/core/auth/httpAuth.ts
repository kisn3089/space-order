import { AxiosResponse } from "axios";
import { http, updateAxiosAuthorizationHeader } from "../axios/http";
import { AccessToken, SignInPayload } from "./auth.type";
import { COOKIE_TABLE, TokenPayload } from "@spaceorder/db";

const prefix = "/auth/v1";

async function createAccessToken(
  signInPayload: SignInPayload,
  role: TokenPayload["role"]
): Promise<AxiosResponse<AccessToken>> {
  const response = await http.post<AccessToken>(
    `${prefix}/${role}/signin`,
    signInPayload
  );
  updateAxiosAuthorizationHeader(response.data.accessToken);
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
  updateAxiosAuthorizationHeader(response.data.accessToken);
  return response;
}

export const httpAuth = { createAccessToken, refreshAccessToken };

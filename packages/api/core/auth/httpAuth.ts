import { AxiosResponse } from "axios";
import { http, updateAxiosAuthorizationHeader } from "../axios/http";
import { AccessToken, SignInPayload } from "./auth.type";
import { COOKIE_TABLE } from "@spaceorder/db";

const prefix = "/token";

async function createAccessToken({
  email,
  password,
}: SignInPayload): Promise<AxiosResponse<AccessToken>> {
  const response = await http.post<AccessToken>(`${prefix}`, {
    email,
    password,
  });
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

export const httpToken = { createAccessToken, refreshAccessToken };

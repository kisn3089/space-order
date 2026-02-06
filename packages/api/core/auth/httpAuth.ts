import { AxiosResponse } from "axios";
import { http, updateAxiosAuthorizationHeader } from "../axios/http";
import { AccessToken, SignInPayload } from "./auth.type";
import { COOKIE_TABLE } from "@spaceorder/db";

const prefix = "/owner/v1/auth";

async function createAccessToken(
  signInPayload: SignInPayload
): Promise<AxiosResponse<AccessToken>> {
  const response = await http.post<AccessToken>(
    `${prefix}/signin`,
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

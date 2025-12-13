"use server";

import { AccessToken, httpMe, httpToken } from "@spaceorder/api";
import { PlainOwner } from "@spaceorder/db";
import { cookies } from "next/headers";

type RefreshAccessTokenResponse =
  | {
      hasRefreshToken: false;
      authInfo: null;
      userInfo: null;
    }
  | {
      hasRefreshToken: true;
      authInfo: AccessToken;
      userInfo: PlainOwner;
    };
/**
 * Server Action: Refresh Token으로 새로운 Access Token 발급
 */
export async function RefreshAccessToken(): Promise<RefreshAccessTokenResponse> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("Refresh");

  const emptyResponse: RefreshAccessTokenResponse = {
    hasRefreshToken: false,
    authInfo: null,
    userInfo: null,
  };

  if (!refreshToken?.value) {
    return emptyResponse;
  }

  try {
    const accessTokenByRefreshToken = await httpToken.refreshAccessToken({
      cookie: refreshToken.value,
    });

    const userInfoByAccessToken = await httpMe.me(
      accessTokenByRefreshToken.data.accessToken
    );

    return {
      hasRefreshToken: true,
      authInfo: accessTokenByRefreshToken.data,
      userInfo: userInfoByAccessToken.data,
    };
  } catch (error) {
    console.error("Token reissuance error:", error);
    return emptyResponse;
  }
}

"use server";

import { httpToken } from "@spaceorder/api";
import { cookies } from "next/headers";

type RefreshAccessTokenResponse =
  | {
      hasRefreshToken: false;
      token: {
        accessToken: null;
        expiresAt: null;
      };
    }
  | {
      hasRefreshToken: true;
      token: {
        accessToken: string;
        expiresAt: Date;
      };
    };
/**
 * Server Action: Refresh Token으로 새로운 Access Token 발급
 */
export async function RefreshAccessToken(): Promise<RefreshAccessTokenResponse> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("Refresh");

  const emptyResponse: RefreshAccessTokenResponse = {
    hasRefreshToken: false,
    token: {
      accessToken: null,
      expiresAt: null,
    },
  };

  if (!refreshToken?.value) {
    return emptyResponse;
  }

  try {
    const resultRefreshAccessToken = await httpToken.refreshAccessToken({
      cookie: refreshToken.value,
    });
    // [TODO:] 받은 토큰으로 사용자 정보 조회 /me

    return {
      hasRefreshToken: true,
      token: resultRefreshAccessToken.data,
    };
  } catch (error) {
    console.error("Token reissuance error:", error);
    return emptyResponse;
  }
}

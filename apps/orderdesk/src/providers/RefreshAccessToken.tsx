"use server";

import { AccessToken, httpToken } from "@spaceorder/api";
import { cookies } from "next/headers";

type RefreshAccessTokenResponse = AccessToken;

/**
 * Server Action: Refresh Token으로 새로운 Access Token 발급
 * @throws {Error} Refresh Token이 없거나 만료된 경우
 */
export async function RefreshAccessToken(): Promise<RefreshAccessTokenResponse> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("Refresh");

  // middleware에서 이미 체크하지만, 안전하게 한 번 더 검사하는 로직으로 오류 시 오류 노출해야 함
  if (!refreshToken?.value) {
    throw new Error("No Refresh Token");
  }

  // 여기서 오류 시 Refresh Token이 만료된 것이므로 상위 클라이언트에서 처리 필요
  const accessTokenByRefreshToken = await httpToken.refreshAccessToken(
    refreshToken.value
  );

  return accessTokenByRefreshToken.data;
}

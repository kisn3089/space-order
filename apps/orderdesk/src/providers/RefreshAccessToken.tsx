"use server";

import { AccessToken, httpToken } from "@spaceorder/api";
import { COOKIE_TABLE } from "@spaceorder/db";
import { cookies } from "next/headers";

type RefreshAccessTokenResponse = AccessToken;

/**
 * Server Action: refresh Token으로 새로운 Access Token 발급
 * @throws {Error} refresh Token이 없거나 만료된 경우
 */
export async function RefreshAccessToken(): Promise<RefreshAccessTokenResponse> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get(COOKIE_TABLE.REFRESH);

  // middleware에서 이미 체크하지만, 안전하게 한 번 더 검사하는 로직으로 오류 시 오류 노출해야 함
  if (!refreshToken?.value) {
    throw new Error("No refresh Token");
  }

  // 여기서 오류 시 refresh Token이 만료된 것이므로 상위 컴포넌트에서 처리 필요
  const accessTokenByRefreshToken = await httpToken.refreshAccessToken(
    refreshToken.value
  );

  return accessTokenByRefreshToken.data;
}

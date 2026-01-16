"use server";

import parseCookieFromResponseHeader, {
  setCookieFromResponseHeader,
} from "@/utils/parseCookieFromResponseHeader";
import { ResponseAccessToken, httpToken } from "@spaceorder/api";
import { COOKIE_TABLE } from "@spaceorder/db/constants";
import { getServerCookie } from "./cookies";

type RefreshAccessTokenResponse = ResponseAccessToken;

/**
 * refresh Token으로 새로운 Access Token 발급
 *
 * @throws {Error} refresh Token이 쿠키에 없거나 요청에 실패할 경우
 */
export async function refreshAccessToken(): Promise<RefreshAccessTokenResponse> {
  const refreshToken = (await getServerCookie(COOKIE_TABLE.REFRESH))?.value;

  /** middleware에서 이미 체크하지만, 안전하게 한 번 더 검사하는 로직 */
  if (!refreshToken) {
    throw new Error("No refresh Token");
  }

  const accessTokenByRefreshToken =
    await httpToken.refreshAccessToken(refreshToken);

  const cookieFromResponseHeader =
    accessTokenByRefreshToken.headers["set-cookie"];
  if (cookieFromResponseHeader) {
    const responseCookies = parseCookieFromResponseHeader(
      cookieFromResponseHeader
    );
    await setCookieFromResponseHeader(responseCookies);
  }

  return accessTokenByRefreshToken.data;
}

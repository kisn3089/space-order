import { httpToken } from "@spaceorder/api";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * 서버 컴포넌트에서 access token을 가져오는 함수
 * React cache를 사용하여 동일한 렌더링 사이클에서 한 번만 토큰을 발급받음
 */
export const getAccessToken = cache(async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("Refresh")?.value;

    if (!refreshToken) {
      console.error("no refresh token on cookies");
      return null;
    }

    const { data: tokenData } =
      await httpToken.refreshAccessToken(refreshToken);

    console.log("cache getAccessToken");

    return tokenData.accessToken;
  } catch (error) {
    console.error("Failed to refresh token on server:", error);
    return null;
  }
});

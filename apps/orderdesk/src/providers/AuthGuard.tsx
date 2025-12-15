"use client";

import { useAuthInfo } from "./AuthenticationProvider";
import React from "react";
import { RefreshAccessToken } from "./RefreshAccessToken";
import AxiosInterceptor from "@/lib/AxiosInterceptor";
import { insertAuthorizationHeader } from "@spaceorder/api";

export default function AuthGuard({ children }: React.PropsWithChildren) {
  const { authInfo, setAuthInfo } = useAuthInfo();

  React.useEffect(() => {
    (async () => {
      // 새로고침 시 access token 재발급
      const refreshedAccessToken = await RefreshAccessToken();
      if (refreshedAccessToken.hasRefreshToken) {
        setAuthInfo(refreshedAccessToken.authInfo);
        insertAuthorizationHeader(refreshedAccessToken.authInfo.accessToken);
      }
    })();
  }, []);

  if (!authInfo.accessToken) {
    return null;
  }

  return <AxiosInterceptor>{children}</AxiosInterceptor>;
}

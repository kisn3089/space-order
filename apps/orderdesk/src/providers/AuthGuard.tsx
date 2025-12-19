"use client";

import { useAuthInfo } from "./AuthenticationProvider";
import React from "react";
import { RefreshAccessToken } from "./RefreshAccessToken";
import AxiosInterceptor from "@/lib/AxiosInterceptor";
import { insertAuthorizationHeader } from "@spaceorder/api";

export default function AuthGuard({ children }: React.PropsWithChildren) {
  const { authInfo, setAuthInfo, signOut } = useAuthInfo();

  React.useEffect(() => {
    (async () => {
      try {
        // 새로고침 시 access token 재발급
        const refreshedAccessToken = await RefreshAccessToken();
        setAuthInfo(refreshedAccessToken);
        insertAuthorizationHeader(refreshedAccessToken.accessToken);
      } catch {
        console.error("[AuthGuard] Failed to refresh access token");
        signOut();
      }
    })();
  }, []);

  if (!authInfo.accessToken) {
    return null;
  }

  return <AxiosInterceptor>{children}</AxiosInterceptor>;
}

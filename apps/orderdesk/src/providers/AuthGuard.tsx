"use client";

import { useAuthInfo } from "./AuthenticationProvider";
import React from "react";
import { RefreshAccessToken } from "./RefreshAccessToken";
import AxiosInterceptor from "@/lib/AxiosInterceptor";
import { AccessToken, updateAxiosAuthorizationHeader } from "@spaceorder/api";

export default function AuthGuard({ children }: React.PropsWithChildren) {
  const { authInfo, setAuthInfo, signOut } = useAuthInfo();

  React.useEffect(() => {
    (async () => {
      try {
        /** 새로고침 시 access token 재발급 */
        if (isValidToken(authInfo)) {
          return;
        }

        console.log("[AuthGuard] Refreshing access token...");
        const refreshedAccessToken = await RefreshAccessToken();
        setAuthInfo(refreshedAccessToken);
        updateAxiosAuthorizationHeader(refreshedAccessToken.accessToken);
      } catch (error: unknown) {
        console.error("[AuthGuard] Failed to refresh access token", error);
        signOut();
      }
    })();
  }, [authInfo.expiresAt]);

  if (!authInfo.accessToken) {
    return null;
  }

  return <AxiosInterceptor>{children}</AxiosInterceptor>;
}

function isValidToken({ accessToken, expiresAt }: AccessToken) {
  return accessToken && expiresAt && new Date(expiresAt) > new Date();
}

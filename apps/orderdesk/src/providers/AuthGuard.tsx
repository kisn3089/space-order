"use client";

import React, { ReactNode, useEffect } from "react";
import { refreshAccessToken } from "../app/common/servers/refreshAccessToken";
import { isExpired, useAuthInfo } from "@spaceorder/auth";
import { getAccessToken } from "@/app/common/servers/getAccessToken";
import { useQueryClient } from "@tanstack/react-query";
import { updateAxiosAuthorizationHeader } from "@spaceorder/api";

type AuthGuardProps = {
  children: ReactNode;
};
export default function AuthGuard({ children }: AuthGuardProps) {
  const { authInfo, setAuthInfo, signOut } = useAuthInfo();
  const queryClient = useQueryClient();

  useEffect(() => {
    const signOutWithCacheClear = () => {
      queryClient.clear();
      signOut();
    };

    /** 새로고침 시 useAuthInfo 갱신 */
    (async () => {
      const accessToken = await getAccessToken();

      if (accessToken && !isExpired(accessToken)) {
        setAuthInfo({ accessToken });
        updateAxiosAuthorizationHeader(accessToken);
        return;
      }

      try {
        console.info("[AuthGuard] Refreshed access token...");
        const refreshedAccessToken = await refreshAccessToken();
        setAuthInfo({ accessToken: refreshedAccessToken.accessToken });
      } catch (error: unknown) {
        console.error("[AuthGuard] Failed to refresh access token", error);
        signOutWithCacheClear();
      }
    })();
  }, [queryClient, setAuthInfo, signOut]);

  if (!authInfo.accessToken) {
    return null;
  }

  return <>{children}</>;
}

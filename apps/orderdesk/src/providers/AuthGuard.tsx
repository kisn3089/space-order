"use client";

import React from "react";
import { refreshAccessToken } from "../app/common/servers/refreshAccessToken";
import { isExpired, useAuthInfo } from "@spaceorder/auth";
import { getAccessToken } from "@/app/common/servers/getAccessToken";
import { useQueryClient } from "@tanstack/react-query";
import { updateAxiosAuthorizationHeader } from "@spaceorder/api";

type AuthGuardProps = {
  children: React.ReactNode;
};
export default function AuthGuard({ children }: AuthGuardProps) {
  const { authInfo, setAuthInfo, signOut } = useAuthInfo();
  const queryClient = useQueryClient();

  React.useEffect(() => {
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
        updateAxiosAuthorizationHeader(refreshedAccessToken.accessToken);
      } catch (error: unknown) {
        console.error("[AuthGuard] Failed to refresh access token", error);
        signOut();
      }
    })();

    return () => {
      queryClient.clear();
    };
  }, []);

  if (!authInfo.accessToken) {
    return null;
  }

  console.log("authInfo: ", authInfo);

  return <>{children}</>;
}

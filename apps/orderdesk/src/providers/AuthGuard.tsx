"use client";

import React from "react";
import { updateAxiosAuthorizationHeader } from "@spaceorder/api";
import { refreshAccessToken } from "../app/common/servers/refreshAccessToken";
import { useAuthInfo } from "@spaceorder/auth";
import { getAccessToken } from "@/app/common/servers/getAccessToken";
import { useQueryClient } from "@tanstack/react-query";

type AuthGuardProps = {
  children: React.ReactNode;
};
export default function AuthGuard({ children }: AuthGuardProps) {
  const { authInfo, setAuthInfo, signOut } = useAuthInfo();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    /** 새로고침 시 access token 재발급 */
    (async () => {
      console.log("[AuthGuard] Refreshing access token...");
      const accessToken = await getAccessToken();
      if (accessToken) {
        setAuthInfo({ accessToken });
        updateAxiosAuthorizationHeader(accessToken);
        return;
      }

      try {
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

  return <>{children}</>;
}

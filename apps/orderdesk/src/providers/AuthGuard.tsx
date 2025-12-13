"use client";

import axiosInterceptor from "@spaceorder/api/core/axios/interceptor";
import { useAuthInfo } from "./AuthenticationProvider";
import React from "react";
import { RefreshAccessToken } from "./RefreshAccessToken";

export default function AuthGuard({ children }: React.PropsWithChildren) {
  const { authInfo, setAuthInfo } = useAuthInfo();

  React.useEffect(() => {
    (async () => {
      const refreshedAccessToken = await RefreshAccessToken();
      if (refreshedAccessToken.hasRefreshToken) {
        setAuthInfo(refreshedAccessToken.token);
        // 여기서 userInfo도 저장해야 함
      }
    })();

    axiosInterceptor(authInfo.accessToken);
  }, []); // authInfo가 필요할까? interceptor response로 refresh되면 되지 않을까?

  if (!authInfo.accessToken) return null;

  return <>{children}</>;
}

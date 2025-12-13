"use client";

import axiosInterceptor from "@spaceorder/api/core/axios/interceptor";
import { useAuthInfo } from "./AuthenticationProvider";
import React from "react";
import { RefreshAccessToken } from "./RefreshAccessToken";
import { useUserInfo } from "./UserInfoProvider";

export default function AuthGuard({ children }: React.PropsWithChildren) {
  const { authInfo, setAuthInfo } = useAuthInfo();
  const { userInfo, setUserInfo } = useUserInfo();

  React.useEffect(() => {
    (async () => {
      const refreshedAccessToken = await RefreshAccessToken();
      if (refreshedAccessToken.hasRefreshToken) {
        setAuthInfo(refreshedAccessToken.authInfo);
        setUserInfo(refreshedAccessToken.userInfo);

        // 여기서 userInfo도 저장해야 함
      }
    })();

    axiosInterceptor(authInfo.accessToken);
  }, []); // authInfo가 필요할까? interceptor response로 refresh되면 되지 않을까?

  if (!authInfo.accessToken || !userInfo.publicId) return null;

  return <>{children}</>;
}

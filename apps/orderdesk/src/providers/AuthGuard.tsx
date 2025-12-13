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
      }
    })();

    console.log("refreshedAccessToken.authInfo: ");
    axiosInterceptor(authInfo.accessToken); // 여러번 생성된다, 변경 필요
  }, [authInfo.accessToken]);

  if (!authInfo.accessToken || !userInfo.publicId) return null;

  return <>{children}</>;
}

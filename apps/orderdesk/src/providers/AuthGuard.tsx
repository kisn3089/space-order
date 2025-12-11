"use client";

import axiosInterceptor from "@spaceorder/api/core/axios/interceptor";
import { useAuthInfo } from "./AuthenticationProvider";
import React from "react";
import { TokenReIssuance } from "./TokenReIssuance";

export default function AuthGuard({ children }: React.PropsWithChildren) {
  const { authInfo } = useAuthInfo();

  React.useEffect(() => {
    console.log("create interceptor count");

    (async () => {
      const aa = await TokenReIssuance();
      console.log("aa: ", aa);
    })();
    axiosInterceptor(authInfo.accessToken);
  }, [authInfo.accessToken]);

  // const cookie = cookieStore.get("Refresh");
  // console.log("cookie: ", cookie);

  if (!authInfo.accessToken) return null;

  console.log("auth guard pass: ", authInfo);

  return <>{children}</>;
}

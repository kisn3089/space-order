"use client";

import { refreshAccessToken } from "@/app/common/servers/refreshAccessToken";
import { setupAuthInterceptor } from "@spaceorder/api";
import { useAuthInfo } from "@spaceorder/auth";
import React, { ReactNode, useEffect } from "react";

export default function AxiosInterceptor({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { setAuthInfo, signOut } = useAuthInfo();

  useEffect(() => {
    setupAuthInterceptor({
      refreshAccessToken,
      setAuthInfo,
      signOut,
    });
  }, [setAuthInfo, signOut]);

  return <>{children}</>;
}

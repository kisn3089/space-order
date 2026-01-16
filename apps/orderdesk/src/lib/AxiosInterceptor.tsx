"use client";

import { refreshAccessToken } from "@/app/common/servers/refreshAccessToken";
import { setupAuthInterceptor } from "@spaceorder/api";
import { useAuthInfo } from "@spaceorder/auth";
import React from "react";

export default function AxiosInterceptor({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setAuthInfo, signOut } = useAuthInfo();

  React.useEffect(() => {
    setupAuthInterceptor({
      refreshAccessToken,
      setAuthInfo,
      signOut,
    });
  }, []);

  return <>{children}</>;
}

"use client";

import { useAuthInfo } from "@/providers/AuthenticationProvider";
import {
  http,
  httpToken,
  updateAxiosAuthorizationHeader,
} from "@spaceorder/api";
import {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import React from "react";

type AxiosCustomError = {
  errorCode: number;
  message: string;
  status: number;
};

export default function AxiosInterceptor({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setAuthInfo, signOut } = useAuthInfo();

  function requestInterceptor(request: InternalAxiosRequestConfig) {
    return request;
  }

  async function responseErrorInterceptor(
    error: AxiosError<AxiosCustomError, AxiosRequestConfig>
  ) {
    if (error instanceof AxiosError && error.config) {
      if (error.response?.status === 419) {
        try {
          const newAccessToken = await httpToken.refreshAccessToken();

          if (!newAccessToken?.data?.accessToken) {
            return Promise.reject(error);
          }

          setAuthInfo({
            accessToken: newAccessToken.data.accessToken,
            expiresAt: newAccessToken.data.expiresAt,
          });
          updateAxiosAuthorizationHeader(newAccessToken.data.accessToken);

          // 현재 실패한 요청 새 토큰으로 재시도
          error.config.headers["Authorization"] =
            `Bearer ${newAccessToken.data.accessToken}`;
          return http(error.config);
        } catch {
          signOut();
        }
      }

      if (
        error.response?.status === 403 &&
        !error.config.url?.includes("/token/refresh")
      ) {
        signOut();
      }
    }
    return Promise.reject(error);
  }

  React.useEffect(() => {
    console.log("interceptor instance 생성");
    const requestInterceptorId =
      http.interceptors.request.use(requestInterceptor);
    const responseInterceptorId = http.interceptors.response.use(
      undefined,
      responseErrorInterceptor
    );
    return () => {
      console.log("interceptor instance 제거");
      http.interceptors.request.eject(requestInterceptorId);
      http.interceptors.response.eject(responseInterceptorId);
    };
  }, []);

  return <>{children}</>;
}

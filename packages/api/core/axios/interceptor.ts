import {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { http } from "./http";
import { httpToken } from "../token";

type AxiosCustomError = {
  errorCode: number;
  message: string;
  status: number;
};

// [TODO:] 추후 CORS 설정 필요
//  headers: {
//   "Access-Control-Allow-Origin": "https://",
// },

// instance가 계속 생긴다?
export default function axiosInterceptor(token: string) {
  function requestInterceptor(request: InternalAxiosRequestConfig) {
    if (!request.headers.Authorization && token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    // console.log("[Request]", {
    //   method: request.method?.toUpperCase(),
    //   url: request.url,
    //   baseURL: request.baseURL,
    //   params: request.params,
    //   data: request.data,
    //   headers: request.headers.Authorization,
    // });
    return request;
  }

  function requestErrorInterceptor(error: any) {
    console.error("[Request Error]", {
      message: error.message,
      config: error.config,
    });
    return Promise.reject(error);
  }

  function responseInterceptor(response: AxiosResponse) {
    console.log("[Response]", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  }

  async function responseErrorInterceptor(
    error: AxiosError<AxiosCustomError, AxiosRequestConfig>
  ) {
    // [TODO:] refresh 만료 시 재로그인 유도 필요
    if (
      error instanceof AxiosError &&
      error.response?.status === 419 &&
      error.config
    ) {
      try {
        const newAccessToken = await httpToken.refreshAccessToken();

        if (!newAccessToken?.data?.accessToken) {
          return Promise.reject(error);
        }

        const newToken = `Bearer ${newAccessToken.data.accessToken}`;

        // axios instance의 기본 헤더 업데이트 (이후 모든 요청에 적용)
        http.defaults.headers.common["Authorization"] = newToken;

        // 현재 실패한 요청도 새 토큰으로 재시도
        error.config.headers["Authorization"] = newToken;

        return http(error.config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    // console.error("[Response Error]", {
    //   status: error.response?.status,
    //   statusText: error.response?.statusText,
    //   url: error.config?.url,
    //   message: error.message,
    //   data: error.response?.data,
    // });
    return Promise.reject(error);
  }

  http.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
  http.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
}

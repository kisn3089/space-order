import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { http } from "./http";

// [TODO:] 추후 CORS 설정 필요
//  headers: {
//   "Access-Control-Allow-Origin": "https://",
// },

// instance가 계속 생긴다?
export default function axiosInterceptor(token: string) {
  function requestInterceptor(request: InternalAxiosRequestConfig) {
    if (!request.headers.Authorization) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    // console.log("[Request]", {
    //   method: request.method?.toUpperCase(),
    //   url: request.url,
    //   baseURL: request.baseURL,
    //   params: request.params,
    //   data: request.data,
    //   headers: request.headers,
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

  function responseErrorInterceptor(error: any) {
    console.error("[Response Error]", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }

  http.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
  http.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
}

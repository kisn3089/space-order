import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8080/",
  timeout: 1000,
  withCredentials: true,
  //   headers: { "X-Custom-Header": "foobar" },
});

function requestInterceptor(request: InternalAxiosRequestConfig<any>) {
  // const cookies = request.headers
  console.log("[Request]", {
    method: request.method?.toUpperCase(),
    url: request.url,
    baseURL: request.baseURL,
    params: request.params,
    data: request.data,
    headers: request.headers,
  });
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

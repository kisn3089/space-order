import axios, { AxiosError, AxiosRequestConfig } from "axios";

const isServer = typeof window === "undefined";

export const http = axios.create({
  baseURL: isServer
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    : process.env.NEXT_PUBLIC_ORDERHUB_URL || "http://localhost:8080",
  timeout: 10000,
  withCredentials: true,
});

export function updateAxiosAuthorizationHeader(token: string) {
  http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

type AxiosCustomError = {
  errorCode: number;
  message: string;
  status: number;
};

type AuthCallbacks = {
  refreshAccessToken: () => Promise<{ accessToken: string }>;
  setAuthInfo: (authInfo: { accessToken: string }) => void;
  signOut: () => void;
};

let authCallbacks: AuthCallbacks | null = null;

export function setupAuthInterceptor(callbacks: AuthCallbacks) {
  authCallbacks = callbacks;
}

http.interceptors.response.use(
  undefined,
  async (error: AxiosError<AxiosCustomError, AxiosRequestConfig>) => {
    if (error instanceof AxiosError && error.config) {
      if (error.response?.status === 419 && authCallbacks) {
        try {
          const newAccessToken = await authCallbacks.refreshAccessToken();

          authCallbacks.setAuthInfo({
            accessToken: newAccessToken.accessToken,
          });
          updateAxiosAuthorizationHeader(newAccessToken.accessToken);

          error.config.headers["Authorization"] =
            `Bearer ${newAccessToken.accessToken}`;
          return http(error.config);
        } catch (refreshError) {
          authCallbacks?.signOut();
        }
      }

      if (
        error.response?.status === 403 &&
        !error.config.url?.includes("/token/refresh") &&
        authCallbacks
      ) {
        authCallbacks.signOut();
      }
    }

    return Promise.reject(error);
  }
);

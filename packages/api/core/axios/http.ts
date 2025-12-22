import axios from "axios";

// [TODO:] 추후 CORS 설정 필요
//  headers: {
//   "Access-Control-Allow-Origin": "https://",
// },

export const http = axios.create({
  baseURL: "http://localhost:8080/", // 추후 환경변수로 관리
  timeout: 10000,
  withCredentials: true,
});

export function updateAxiosAuthorizationHeader(token: string) {
  http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

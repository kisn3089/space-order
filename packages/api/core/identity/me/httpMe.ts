import { PublicOwner } from "@spaceorder/db";
import { http } from "../../axios";
import { AxiosRequestConfig } from "axios";

const prefix = "/identity/v1/me";

async function fetchMe(): Promise<PublicOwner> {
  const response = await http.get<PublicOwner>(`${prefix}`);
  return response.data;
}

async function fetchUpdate(): Promise<PublicOwner> {
  const response = await http.patch<PublicOwner>(`${prefix}`);
  return response.data;
}

export type HealthCheckResponse = {
  status: string;
  timestamp: string;
};
async function fetchHealthCheck(
  config?: AxiosRequestConfig
): Promise<HealthCheckResponse> {
  const response = await http.get<HealthCheckResponse>(`/`, config);
  return response.data;
}

export const httpMe = {
  fetchMe,
  fetchUpdate,
  fetchHealthCheck,
};

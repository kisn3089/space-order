import { PublicOwner } from "@spaceorder/db";
import { http } from "../axios";
import { AxiosRequestConfig } from "axios";

const prefix = "/me";

async function me(accessToken?: string): Promise<PublicOwner> {
  const response = await http.get<PublicOwner>(
    `${prefix}`,
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : {}
  );
  return response.data;
}

export type HealthCheckResponse = {
  status: string;
  timestamp: string;
};
async function healthCheck(
  config?: AxiosRequestConfig
): Promise<HealthCheckResponse> {
  const response = await http.get<HealthCheckResponse>(``, config);
  return response.data;
}

export const httpMe = { me, healthCheck };

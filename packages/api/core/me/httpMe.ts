import { PublicOwner, PublicStoreWithTablesAndOrders } from "@spaceorder/db";
import { http } from "../axios";
import { AxiosRequestConfig } from "axios";

const prefix = "/me";

async function fetchMe(accessToken?: string): Promise<PublicOwner> {
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

async function fetchMyOrderList(): Promise<PublicStoreWithTablesAndOrders> {
  const response = await http.get<PublicStoreWithTablesAndOrders>(
    `${prefix}/orders`
  );
  return response.data;
}

export type HealthCheckResponse = {
  status: string;
  timestamp: string;
};
async function fetchHealthCheck(
  config?: AxiosRequestConfig
): Promise<HealthCheckResponse> {
  const response = await http.get<HealthCheckResponse>(``, config);
  return response.data;
}

export const httpMe = {
  fetchMe,
  fetchMyOrderList,
  fetchHealthCheck,
};

import { PlainOwner } from "@spaceorder/db";
import { AxiosResponse } from "axios";
import { http } from "../axios";

const prefix = "/me";

async function me(accessToken: string): Promise<AxiosResponse<PlainOwner>> {
  return await http.get<PlainOwner>(`${prefix}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export const httpMe = { me };

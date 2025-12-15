import { PlainOwner } from "@spaceorder/db";
import { http } from "../axios";

const prefix = "/me";

async function me(accessToken?: string): Promise<PlainOwner> {
  const response = await http.get<PlainOwner>(
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

export const httpMe = { me };

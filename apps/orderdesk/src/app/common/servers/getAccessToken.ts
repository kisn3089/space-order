"use server";

import { COOKIE_TABLE } from "@spaceorder/db/constants";
import { getServerCookie } from "./cookies";

export async function getAccessToken() {
  return (await getServerCookie(COOKIE_TABLE.ACCESS_TOKEN))?.value;
}

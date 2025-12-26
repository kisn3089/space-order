"use server";

import { COOKIE_TABLE } from "@spaceorder/db";
import { cookies } from "next/headers";

type CookieItem = (typeof COOKIE_TABLE)[keyof typeof COOKIE_TABLE];
export default async function clearCookie(cookieItem: CookieItem) {
  const cookieStore = cookies();

  cookieStore.delete(cookieItem);
}

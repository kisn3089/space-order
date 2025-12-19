"use server";

import { cookies } from "next/headers";

type CookieItem = "Refresh";
export default async function clearCookie(cookieItem: CookieItem) {
  const cookieStore = cookies();

  cookieStore.delete(cookieItem);
}

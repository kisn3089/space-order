"use server";

import { COOKIE_TABLE } from "@spaceorder/db/constants";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

type CookieKey = (typeof COOKIE_TABLE)[keyof typeof COOKIE_TABLE];
export type NextCookie = {
  name: CookieKey;
  value: string;
} & Pick<ResponseCookie, "path" | "maxAge" | "expires">;

export async function getServerCookie(name: CookieKey) {
  const cookieStore = cookies();
  return cookieStore.get(name);
}

export async function setServerCookie(
  name: CookieKey,
  value: string,
  options?: Pick<ResponseCookie, "path" | "maxAge" | "expires">
) {
  const cookieStore = cookies();
  cookieStore.set(name, value, {
    path: options?.path ?? "/",
    ...options,
  });
}

export async function clearServerCookie(name: CookieKey) {
  const cookieStore = cookies();
  cookieStore.delete(name);
}

import { COOKIE_TABLE } from "@spaceorder/db/constants";
import { CookieOptions, Response } from "express";

function set(
  response: Response,
  name: (typeof COOKIE_TABLE)[keyof typeof COOKIE_TABLE],
  value: string,
  cookieOptions: Omit<CookieOptions, "httpOnly" | "sameSite" | "secure">
) {
  return response.cookie(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...cookieOptions,
  });
}

function remove(
  response: Response,
  name: (typeof COOKIE_TABLE)[keyof typeof COOKIE_TABLE],
  cookieOptions: Omit<CookieOptions, "httpOnly" | "sameSite" | "secure">
) {
  return response.clearCookie(name, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...cookieOptions,
  });
}

export const responseCookie = {
  set,
  remove,
};

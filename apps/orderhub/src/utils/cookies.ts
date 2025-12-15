import { CookieOptions, Response } from 'express';

function set(
  response: Response,
  name: string,
  value: string,
  cookieOptions: Omit<CookieOptions, 'httpOnly' | 'sameSite' | 'secure'>,
): Response<any, Record<string, any>> {
  return response.cookie(name, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    ...cookieOptions,
  });
}

function remove(
  response: Response,
  name: string,
  cookieOptions: Omit<CookieOptions, 'httpOnly' | 'sameSite' | 'secure'>,
): Response<any, Record<string, any>> {
  return response.clearCookie(name, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    ...cookieOptions,
  });
}

export const responseCookie = {
  set,
  remove,
};

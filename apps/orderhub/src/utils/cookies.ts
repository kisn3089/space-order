import { RequireCookieOptions } from '@spaceorder/auth/utils';
import { CookieOptions, Response } from 'express';

function set(
  response: Response,
  name: string,
  value: string,
  cookieOptions: Omit<
    RequireCookieOptions & CookieOptions,
    'httpOnly' | 'sameSite'
  >,
): Response<any, Record<string, any>> {
  return response.cookie(name, value, {
    httpOnly: true,
    sameSite: 'lax',
    ...cookieOptions,
  });
}

export const responseCookie = {
  set,
};

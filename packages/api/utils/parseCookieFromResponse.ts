import { COOKIE_TABLE } from "@spaceorder/db/constants";

type CookieKey = (typeof COOKIE_TABLE)[keyof typeof COOKIE_TABLE];
export type NextCookie = {
  name: CookieKey;
  value: string;
  path?: string;
  expires?: Date;
  maxAge?: number;
};

export default function parseCookieFromResponse(
  setCookieHeader: string[]
): NextCookie[] {
  const responseCookies: NextCookie[] = [];
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  for (const cookieString of cookies) {
    const [nameValue, ...attributes] = cookieString.split(";");
    const [name, value] = nameValue.trim().split("=");

    if (
      value &&
      (name === COOKIE_TABLE.REFRESH ||
        name === COOKIE_TABLE.ACCESS_TOKEN ||
        name === COOKIE_TABLE.SESSION_TOKEN)
    ) {
      const cookieOptions: NextCookie = { name, value };

      attributes.forEach((attr) => {
        const [key, val] = attr.trim().split("=");
        const lowerKey = key.toLowerCase();

        if (lowerKey === "path" && val) cookieOptions.path = val;
        if (lowerKey === "expires" && val) {
          cookieOptions.expires = new Date(val);
        }
      });

      responseCookies.push(cookieOptions);
    }
  }
  return responseCookies;
}

export async function setCookieFromResponseHeader(
  responseCookies: NextCookie[],
  callback: ({ name, value, expires, path }: NextCookie) => Promise<void>
) {
  for (const { name, value, expires, path } of responseCookies) {
    await callback({ name, value, expires, path });
  }
}

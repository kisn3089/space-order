import { NextCookie, setServerCookie } from "@/app/common/servers/cookies";
import { COOKIE_TABLE } from "@spaceorder/db/constants";

export default function parseCookieFromResponseHeader(
  setCookieHeader: string[]
): NextCookie[] {
  const responseCookie: NextCookie[] = [];
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  for (const cookieString of cookies) {
    const [nameValue, ...attributes] = cookieString.split(";");
    const [name, value] = nameValue.trim().split("=");

    if (
      value &&
      (name === COOKIE_TABLE.REFRESH || name === COOKIE_TABLE.ACCESS_TOKEN)
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

      responseCookie.push(cookieOptions);
    }
  }
  return responseCookie;
}

export async function setCookieFromResponseHeader(
  responseCookies: NextCookie[]
) {
  for (const { name, value, expires } of responseCookies) {
    await setServerCookie(name, value, { expires });
  }
}

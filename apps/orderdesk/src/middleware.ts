import { isExpired } from "@spaceorder/auth";
import { COOKIE_TABLE } from "@spaceorder/db/constants";
import { NextRequest, NextResponse } from "next/server";
import { httpToken } from "@spaceorder/api/core/token/httpToken";

export async function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_TABLE.REFRESH);
  const accessToken = req.cookies.get(COOKIE_TABLE.ACCESS_TOKEN);

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (!accessToken || isExpired(accessToken?.value)) {
    console.log("[middleware] refresh access token...");
    const newAccessToken = await httpToken.refreshAccessToken(
      refreshToken.value
    );
    const res = NextResponse.next();

    res.cookies.set(
      COOKIE_TABLE.ACCESS_TOKEN,
      newAccessToken.data.accessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(newAccessToken.data.expiresAt),
      }
    );

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*"],
};

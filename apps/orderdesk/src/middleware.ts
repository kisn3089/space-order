import { COOKIE_TABLE } from "@spaceorder/db";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_TABLE.REFRESH);

  if (!refreshToken) {
    const signInUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*"],
};

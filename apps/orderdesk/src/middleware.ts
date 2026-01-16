import { COOKIE_TABLE } from "@spaceorder/db/constants";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_TABLE.REFRESH);

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*"],
};

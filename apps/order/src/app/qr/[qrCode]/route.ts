import { NextRequest, NextResponse } from "next/server";

const ORDERHUB_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode } = await params;

  const apiResponse = await fetch(`${ORDERHUB_URL}/stores/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrCode }),
    redirect: "manual",
  });

  const location = apiResponse.headers.get("location");

  const host = request.headers.get("host") ?? request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  const origin = `${proto}://${host}`;

  if (apiResponse.status !== 302 || !location) {
    return NextResponse.redirect(`${origin}/error`);
  }

  const redirectUrl = location.startsWith("http")
    ? location
    : `${origin}${location.startsWith("/") ? location : `/${location}`}`;
  const response = NextResponse.redirect(redirectUrl);

  const setCookie = apiResponse.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}

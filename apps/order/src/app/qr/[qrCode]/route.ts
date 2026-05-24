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

  if (apiResponse.status !== 302 || !location) {
    return NextResponse.redirect(new URL("/error", request.url));
  }

  const response = NextResponse.redirect(new URL(location, request.url));

  const setCookie = apiResponse.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}

"use server";

import { cookies } from "next/headers";

/**
 * Server Action: Refresh Token으로 새로운 Access Token 발급
 */
export async function TokenReIssuance() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("Refresh");

  console.log("token re-issuance - refresh token: ", refreshToken);

  if (!refreshToken?.value) {
    return {
      success: false,
      error: "No refresh token found",
      accessToken: null,
      expiresAt: null,
    };
  }

  // 실제 API 호출 로직 필요

  //   try {
  //     // TODO: 백엔드 API 호출하여 새 Access Token 발급
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ refreshToken: refreshToken.value }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Token refresh failed");
  //     }

  //     const data = await response.json();

  //     return {
  //       success: true,
  //       error: null,
  //       accessToken: data.accessToken,
  //       expiresAt: new Date(data.expiresAt),
  //     };
  //   } catch (error) {
  //     console.error("Token reissuance error:", error);
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : "Unknown error",
  //       accessToken: null,
  //       expiresAt: null,
  //     };
  //   }
}

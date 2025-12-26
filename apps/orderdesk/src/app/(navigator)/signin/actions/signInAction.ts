"use server";

import { cookies } from "next/headers";
import { AxiosError } from "axios";
import { AccessToken, httpToken } from "@spaceorder/api";
import { COOKIE_TABLE } from "@spaceorder/db";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

type ActionResponse =
  | {
      success: true;
      data: AccessToken;
    }
  | {
      success: false;
      error: {
        message: string;
        statusCode?: number;
      };
    };

export default async function signInAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const createdAccessToken = await httpToken.createAccessToken({
      email,
      password,
    });
    const cookieStore = cookies();
    const setCookieHeader = createdAccessToken.headers["set-cookie"];

    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];
      cookies.forEach((cookieString) => {
        const [nameValue, ...attributes] = cookieString.split(";");
        const [name, value] = nameValue.trim().split("=");
        const responseCookieOptions: ResponseCookie = {
          name,
          value,
          path: "/",
          expires: undefined,
        };
        if (name === COOKIE_TABLE.REFRESH && value) {
          attributes.forEach((attr) => {
            const [key, val] = attr.trim().split("=");
            const lowerKey = key.toLowerCase();

            if (lowerKey === "path" && val) responseCookieOptions.path = val;
            if (lowerKey === "expires" && val)
              responseCookieOptions.expires = new Date(val);
          });
          cookieStore.set(name, value, responseCookieOptions);
        }
      });
    }

    console.log("success signIn: ", email);
    return {
      success: true,
      data: createdAccessToken.data,
    };
  } catch (error) {
    const errorResponse: ActionResponse = {
      success: false,
      error: { message: "로그인 시 서버 오류가 발생했습니다." },
    };

    if (error instanceof AxiosError) {
      if (error.response?.data?.statusCode === 401) {
        errorResponse["error"].message =
          error.response?.data?.message ||
          "이메일 또는 비밀번호가 올바르지 않습니다.";
        return errorResponse;
      }
      return errorResponse;
    }
    return errorResponse;
  }
}

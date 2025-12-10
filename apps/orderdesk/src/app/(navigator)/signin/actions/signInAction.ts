"use server";

import { cookies } from "next/headers";
import { AxiosError } from "axios";
import { httpAuth } from "@spaceorder/api";
import { RequireCookieOptions } from "@spaceorder/auth/utils";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { redirect } from "next/navigation";

export default async function signInAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        error: {
          message: "이메일과 비밀번호를 입력해주세요.",
        },
      };
    }

    const response = await httpAuth.signIn({ email, password });
    const cookieStore = cookies();
    const setCookieHeader = response.headers["set-cookie"];

    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];
      cookies.forEach((cookieString) => {
        const [nameValue, ...attributes] = cookieString.split(";");
        const [name, value] = nameValue.trim().split("=");
        const responseCookieOptions: RequireCookieOptions & ResponseCookie = {
          name,
          value,
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          expires: undefined,
        };
        if (name && value) {
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
      data: response.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.message ||
            "이메일 또는 비밀번호가 올바르지 않습니다.",
          statusCode: error.response?.status,
        },
      };
    }

    return {
      success: false,
      error: {
        message: "로그인 시 서버 오류가 발생했습니다.",
      },
    };
  }
}

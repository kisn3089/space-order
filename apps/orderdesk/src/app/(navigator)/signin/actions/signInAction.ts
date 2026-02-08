"use server";

import { AxiosError } from "axios";
import { AccessToken, httpAuth } from "@spaceorder/api";
import parseCookieFromResponseHeader, {
  setCookieFromResponseHeader,
} from "@/utils/parseCookieFromResponseHeader";

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

    const createdAccessToken = await httpAuth.createAccessToken(
      {
        email,
        password,
      },
      "owner"
    );

    const cookieFromResponseHeader = createdAccessToken.headers["set-cookie"];
    if (cookieFromResponseHeader) {
      const responseCookies = parseCookieFromResponseHeader(
        cookieFromResponseHeader
      );
      await setCookieFromResponseHeader(responseCookies);
    }

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

import { useMutation } from "@tanstack/react-query";
import { SignInRequest } from "./auth.type";
import { httpAuth } from "./httpAuth";

// useMutation Hook을 반환하는 함수
function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInRequest) => {
      return await httpAuth.signIn({ email, password });
    },

    onSuccess: (data) => {
      console.log("success data: ", data);
    },

    onError: (data) => console.log("error: ", data),
  });
}

export const authMutate = { useSignIn };

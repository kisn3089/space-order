import { useMutation } from "@tanstack/react-query";
import { SignInRequest } from "./token.type";
import { httpToken } from "./httpToken";

function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInRequest) => {
      return await httpToken.signIn({ email, password });
    },
  });
}

export const authMutate = { useSignIn };

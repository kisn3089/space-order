import { useMutation } from "@tanstack/react-query";
import { SignInRequest } from "./auth.type";
import { httpAuth } from "./httpAuth";

function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInRequest) => {
      return await httpAuth.signIn({ email, password });
    },
  });
}

export const authMutate = { useSignIn };

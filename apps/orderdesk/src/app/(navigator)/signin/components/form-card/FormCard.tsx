"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@spaceorder/ui/components/button";
import { CardContent, CardFooter } from "@spaceorder/ui/components/card";
import { useForm } from "react-hook-form";
import SignInField from "../sign-in-field/SignInField";
import Link from "next/link";
import { Checkbox } from "@spaceorder/ui/components/checkbox";
import { Label } from "@spaceorder/ui/components/label";
import { signInFormSchema } from "@spaceorder/auth/schemas/signIn.schema";
import signInAction from "../../actions/signInAction";
import { useRouter } from "next/navigation";
import { SignInRequest } from "@spaceorder/api";

export default function FormCard() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInRequest>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: SignInRequest) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const result = await signInAction(formData);

    if (!result.success) {
      console.log("client fail", result);
      setError("password", { message: result.error?.message });
      return;
    }

    router.replace("/orders");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent>
        <div className="flex flex-col gap-2">
          <SignInField
            id="email"
            label="Email"
            type="email"
            placeholder="m@example.com"
            errorMessage={errors.email && errors.email?.message}
            register={register}
          />
          <SignInField
            id="password"
            label="Password"
            type="password"
            errorMessage={errors.password && errors.password?.message}
            register={register}
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full font-bold">
          로그인
        </Button>
        <div className="flex items-center justify-between w-full">
          <div className="flex  gap-2">
            <Checkbox name="isAdmin" id="isAdmin" defaultChecked={false} />
            <Label htmlFor="isAdmin" className="text-xs">
              관리자 로그인
            </Label>
          </div>
          <Link
            href="#"
            className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}

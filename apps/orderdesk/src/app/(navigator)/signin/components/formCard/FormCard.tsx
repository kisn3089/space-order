"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginFormSchema,
  loginFormSchema,
} from "@spaceorder/auth/lib/zod/loginForm/LoginFormSchema";
import { Button } from "@spaceorder/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import { useForm } from "react-hook-form";
import SignInField from "../signInField/SignInField";
import Link from "next/link";

export default function FormCard() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormSchema) => {
    console.log(data);
    // 여기서 로그인 API 호출
  };

  return (
    <Card className="w-full max-w-md min-w-sm">
      <CardHeader className="p-8">
        <CardTitle className="flex justify-center font-bold">
          SPACEORDER
        </CardTitle>
      </CardHeader>
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
          <Link
            href="#"
            className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

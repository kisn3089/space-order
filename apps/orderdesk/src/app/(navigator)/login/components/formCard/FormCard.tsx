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
import { Input } from "@spaceorder/ui/components/input";
import { Label } from "@spaceorder/ui/components/label";
import { useForm } from "react-hook-form";

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
      <CardHeader>
        <CardTitle className="flex justify-center font-bold">LOGO</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <a
            href="#"
            className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
            비밀번호를 잊으셨나요?
          </a>
          <Button type="submit" className="w-full font-bold">
            로그인
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

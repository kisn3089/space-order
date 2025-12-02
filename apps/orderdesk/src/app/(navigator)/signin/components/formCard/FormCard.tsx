"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  LoginFormSchema,
  loginFormSchema,
} from "@spaceorder/auth/lib/zod/loginForm/LoginFormSchema"
import { Button } from "@spaceorder/ui/components/button"
import { CardContent, CardFooter } from "@spaceorder/ui/components/card"
import { useForm } from "react-hook-form"
import SignInField from "../signInField/SignInField"
import Link from "next/link"
import { Checkbox } from "@spaceorder/ui/components/checkbox"
import { Label } from "@spaceorder/ui/components/label"
// import { adminQuery } from "@spaceorder/api/core/admin/adminQuery";

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
  })

  // const { data } = adminQuery.findAll();
  // const { data } = adminQuery.findOne({
  //   publicId: "cmig43icq0000lb19tmkdklyv",
  // });
  // console.log("admins: ", data);

  const onSubmit = (data: LoginFormSchema) => {
    console.log(data)
    // 여기서 로그인 API 호출
  }

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
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-2">
            <Checkbox name="isAdmin" id="isAdmin" defaultChecked={false} />
            <Label htmlFor="isAdmin">관리자 로그인</Label>
          </div>
          <Link
            href="#"
            className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </CardFooter>
    </form>
  )
}

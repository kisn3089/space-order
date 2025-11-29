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

export default function FormCard() {
  return (
    <Card className="w-full max-w-md min-w-sm">
      <CardHeader>
        <CardTitle className="flex justify-center font-bold">LOGO</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
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
    </Card>
  );
}

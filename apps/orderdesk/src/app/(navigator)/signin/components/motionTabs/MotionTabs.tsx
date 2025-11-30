import {
  Tabs,
  TabsContent,
  TabsContents,
} from "@spaceorder/ui/components/animate-ui/components/animate/tabs";
import { Button } from "@spaceorder/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import { Input } from "@spaceorder/ui/components/input";
import { Label } from "@spaceorder/ui/components/label";
import TabList from "./TabList";
import { CardField } from "./TabContent";

{
  /* <CardTitle>Account</CardTitle>
          <CardDescription>
            Make changes to your account here. Click save when you&apos;re done.
          </CardDescription> */
}

const loginTabFields: CardField[] = [
  {
    id: "email",
    label: "이메일",
    value: "",
    defaultValue: "example@example.com",
  },
  {
    id: "password",
    label: "비밀번호",
    value: "",
    defaultValue: "",
  },
];

export default function MotionTabs() {
  return (
    <div className="w-md">
      <Tabs>
        <TabList />
        <TabsContents>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Make changes to your account here. Click save when you&apos;re
                  done.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Name</Label>
                  <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-username">Username</Label>
                  <Input id="tabs-demo-username" defaultValue="@peduarte" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}

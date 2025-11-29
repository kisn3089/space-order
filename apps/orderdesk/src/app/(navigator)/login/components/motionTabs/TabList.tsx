import {
  TabsList,
  TabsTrigger,
} from "@spaceorder/ui/components/animate-ui/components/animate/tabs";

export default function TabList() {
  return (
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
  );
}

import { TabsContent } from "@spaceorder/ui/components/animate-ui/components/animate/tabs";
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

export type CardField = {
  id: string;
  label: string;
  value: string;
  defaultValue?: string;
};

type TabContentProps = {
  title: string;
  description: string;
  cardFields: CardField[];
};
export default function TabContent({
  title,
  description,
  cardFields,
}: TabContentProps) {
  return (
    <TabsContent value="account">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {cardFields.map((field) => (
            <div className="grid gap-3" key={field.id}>
              <Label htmlFor={`tabs-${field.id}`}>{field.label}</Label>
              <Input
                id={`tabs-${field.id}`}
                defaultValue={field.value || field.defaultValue}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button>Save changes</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}

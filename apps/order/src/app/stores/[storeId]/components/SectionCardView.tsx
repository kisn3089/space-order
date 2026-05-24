import { Card } from "@spaceorder/ui/components/card";

type SectionCardViewProps = {
  children: React.ReactNode;
  title: string;
};
export default function SectionCardView({
  children,
  title,
}: SectionCardViewProps) {
  return (
    <section>
      <Card className="p-4 flex flex-col gap-y-3 shadow-xl rounded-4xl">
        <h2 className="font-bold">{title}</h2>
        {children}
      </Card>
    </section>
  );
}

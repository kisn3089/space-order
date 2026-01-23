import { Spinner } from "@spaceorder/ui/components/spinner";

export default function LoadingSpinner() {
  return (
    <div className="h-full grid place-items-center animate-fade-in">
      <Spinner />
    </div>
  );
}

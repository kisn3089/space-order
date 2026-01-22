type ActivityRenderProps = {
  mode: "visible" | "hidden";
  children: React.ReactNode;
};

export default function ActivityRender({
  mode,
  children,
}: ActivityRenderProps) {
  if (mode === "hidden") {
    return null;
  }

  return <>{children}</>;
}

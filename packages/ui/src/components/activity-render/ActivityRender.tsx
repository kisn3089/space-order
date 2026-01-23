type ActivityRenderProps = {
  mode: "visible" | "hidden";
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function ActivityRender({
  mode,
  children,
  fallback,
}: ActivityRenderProps) {
  if (mode === "hidden") {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}

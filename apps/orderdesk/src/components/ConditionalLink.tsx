import Link, { LinkProps } from "next/link";

type TableOrderCardProviderProps = {
  children: React.ReactNode;
  condition: boolean;
} & LinkProps &
  React.LinkHTMLAttributes<HTMLAnchorElement>;

export default function ConditionalLink({
  children,
  condition,
  ...props
}: TableOrderCardProviderProps) {
  if (condition) {
    return <Link {...props}>{children}</Link>;
  }

  return <>{children}</>;
}

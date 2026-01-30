import Link, { LinkProps } from "next/link";

type ConditionalLinkProps = {
  children: React.ReactNode;
  condition: boolean;
} & Omit<LinkProps, "shallow"> &
  React.LinkHTMLAttributes<HTMLAnchorElement>;

export default function ConditionalLink({
  children,
  condition,
  ...props
}: ConditionalLinkProps) {
  if (condition) {
    return <Link {...props}>{children}</Link>;
  }

  return <>{children}</>;
}

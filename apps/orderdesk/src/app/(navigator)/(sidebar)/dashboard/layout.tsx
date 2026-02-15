export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <section className="antialiased h-full">{children}</section>;
}

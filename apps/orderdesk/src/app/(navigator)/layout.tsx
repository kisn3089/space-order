export default function NavigatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased">
      <nav className="flex justify-between items-center w-screen h-16 border-b">
        {/* logo */}
      </nav>
      {children}
    </section>
  );
}

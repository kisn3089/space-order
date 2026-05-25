export default function GridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="antialiased h-full grid place-items-center gap-2 grid-cols-[2fr_minmax(380px,1fr)] px-6 pb-4">
      {children}
    </section>
  );
}

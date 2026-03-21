import StickyCart from "@/components/StickyCart";

export default function TableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen pb-24 md:pb-0 bg-[var(--color-background)]">
      {children}
      <StickyCart />
    </div>
  );
}

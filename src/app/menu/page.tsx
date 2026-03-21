import { supabase } from "@/lib/supabase";
import PublicMenuClient from "./PublicMenuClient";

export default async function MenuPage() {
  const { data: menuItems, error: menuErr } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true);
    
  if (menuErr) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 text-red-500 bg-[var(--color-background)]">
        Error loading menu. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Simple Header */}
      <header className="bg-[var(--color-primary)] text-white p-6 shadow-md text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Woksterrr Full Menu</h1>
        <p className="text-[var(--color-secondary)] font-medium mt-1">Browse our delicious offerings before you visit.</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">
          Back to Home
        </a>
      </header>

      {/* Menu Listing */}
      <PublicMenuClient menuItems={menuItems || []} />
    </div>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Utensils, LogOut, LayoutDashboard, History } from "lucide-react";
import Link from "next/link";
import { logoutAdmin } from "../actions";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--color-primary)] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <Utensils className="text-[var(--color-accent)] w-8 h-8 shrink-0" />
          <h2 className="text-xl font-bold tracking-tight text-white">Kitchen Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium">
            <LayoutDashboard size={20} className="text-[var(--color-secondary)]" />
            Live Orders
          </Link>
          <Link href="/admin/history" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-gray-300 hover:text-white font-medium">
            <History size={20} className="text-[var(--color-secondary)]" />
            Order History
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <form action={logoutAdmin}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-colors font-medium">
              <LogOut size={20} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}

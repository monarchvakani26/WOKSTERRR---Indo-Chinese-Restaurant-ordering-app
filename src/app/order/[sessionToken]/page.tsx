import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import MenuClient from "./MenuClient";

interface TableSession {
  session_token: string;
  expires_at: string;
  status: string;
  table_id: string;
  tables: { table_number: number } | null;
}

function ExpiredScreen({ reason }: { reason: "cookie_mismatch" | "expired" | "not_found" }) {
  const message =
    reason === "cookie_mismatch"
      ? "This ordering link can only be used on the device that scanned the QR code."
      : reason === "expired"
      ? "Your 15-minute ordering session has ended."
      : "This session token is invalid or has already been used.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Session Ended</h2>
        <p className="text-gray-500 font-medium mb-6">{message}</p>
        <div className="bg-[var(--color-background)] rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-bold text-[var(--color-primary)] mb-1">
            📱 What to do
          </p>
          <p className="text-sm text-gray-500">
            Please scan the QR code on your table again to start a new session.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ sessionToken: string }>;
}) {
  const { sessionToken } = await params;

  // 1. The httpOnly cookie must match the URL token.
  //    If they differ, this link was opened on a device that never scanned the QR.
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("woksterrr_order_token")?.value;

  if (!cookieToken || cookieToken !== sessionToken) {
    return <ExpiredScreen reason="cookie_mismatch" />;
  }

  // 2. Validate session: active + not expired
  const { data: session, error: sessionErr } = await supabase
    .from("table_sessions")
    .select("session_token, expires_at, status, table_id, tables(table_number)")
    .eq("session_token", sessionToken)
    .eq("status", "active")
    .maybeSingle();

  if (sessionErr || !session) {
    return <ExpiredScreen reason="not_found" />;
  }

  if (new Date((session as unknown as TableSession).expires_at) < new Date()) {
    return <ExpiredScreen reason="expired" />;
  }

  const typedSession = session as unknown as TableSession;
  const tableNumber = typedSession.tables?.table_number ?? null;

  // 3. Fetch available menu items
  const { data: menuItems, error: menuErr } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true);

  if (menuErr) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 text-red-500">
        Error loading menu. Please refresh.
      </div>
    );
  }

  return (
    <MenuClient
      sessionToken={sessionToken}
      tableNumber={tableNumber}
      menuItems={menuItems ?? []}
    />
  );
}

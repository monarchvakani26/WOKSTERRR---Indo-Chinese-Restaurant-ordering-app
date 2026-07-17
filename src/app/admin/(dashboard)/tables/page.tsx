import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { clearTableSession } from "../../actions";
import { QrCode, RefreshCw, CheckCircle2, Clock, XCircle } from "lucide-react";

interface TableRow {
  id: string;
  table_number: number;
}

interface SessionRow {
  session_token: string;
  status: string;
  expires_at: string;
  created_at: string;
  table_id: string;
}

function SessionBadge({ session }: { session: SessionRow | undefined }) {
  if (!session) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
        <XCircle size={12} />
        No active session
      </span>
    );
  }

  const expiresAt = new Date(session.expires_at);
  const now = new Date();
  const minutesLeft = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / 60000));

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
      <CheckCircle2 size={12} />
      Active · {minutesLeft}m left
    </span>
  );
}

export default async function TableSessionsPage() {
  // Fetch all 10 tables
  const { data: tables } = await supabaseAdmin
    .from("tables")
    .select("id, table_number")
    .order("table_number") as { data: TableRow[] | null };

  // Fetch all currently active, non-expired sessions
  const now = new Date().toISOString();
  const { data: sessions } = await supabaseAdmin
    .from("table_sessions")
    .select("session_token, status, expires_at, created_at, table_id")
    .eq("status", "active")
    .gt("expires_at", now) as { data: SessionRow[] | null };

  // Build a map: table_id → latest active session
  const sessionMap = new Map<string, SessionRow>();
  (sessions ?? []).forEach((s) => {
    const existing = sessionMap.get(s.table_id);
    if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
      sessionMap.set(s.table_id, s);
    }
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)] mb-2 flex items-center gap-3">
          Table Sessions
        </h1>
        <p className="text-gray-500 font-medium">
          View active sessions per table. Use &quot;New Session&quot; to immediately invalidate the
          current QR link and force customers to rescan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(tables ?? []).map((table) => {
          const session = sessionMap.get(table.id);
          const qrUrl = `${baseUrl}/t/table-${table.table_number}`;

          return (
            <div
              key={table.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div
                className={`px-5 py-4 border-b ${
                  session
                    ? "bg-green-50 border-green-100"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[var(--color-primary)]">
                    Table {table.table_number}
                  </h2>
                  <SessionBadge session={session} />
                </div>
              </div>

              {/* Session Details */}
              <div className="px-5 py-4 space-y-3">
                {session ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>
                        Expires:{" "}
                        {new Date(session.expires_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2">
                      <code className="text-[10px] text-gray-400 font-mono truncate flex-1">
                        {session.session_token}
                      </code>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 font-medium">
                    No active session. The next QR scan will create one automatically.
                  </p>
                )}

                {/* QR URL */}
                <div className="flex items-center gap-2 bg-[var(--color-background)] rounded-lg px-3 py-2">
                  <QrCode size={14} className="text-[var(--color-primary)] shrink-0" />
                  <code className="text-[10px] font-mono text-gray-500 truncate flex-1">
                    /t/table-{table.table_number}
                  </code>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5">
                <form
                  action={clearTableSession.bind(null, table.id)}
                >
                  <button
                    type="submit"
                    disabled={!session}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed
                      bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:hover:bg-red-50"
                  >
                    <RefreshCw size={14} />
                    New Session (Invalidate Current)
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-10 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-lg">
        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          How it works
        </h3>
        <ul className="space-y-2 text-sm text-gray-500">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
            QR codes on tables always point to <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/t/table-N</code>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
            On scan, a 15-minute session is created and the customer is redirected to their secure ordering URL
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
            Click &quot;New Session&quot; when a table turns over — this immediately invalidates any old link
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
            Sessions auto-expire after 15 minutes even without manual action
          </li>
        </ul>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableSlug: string }> }
) {
  const { tableSlug } = await params;

  // 1. Enforce that the request must come from a physical scan (?scan=true)
  const isScan = request.nextUrl.searchParams.get("scan") === "true";
  if (!isScan) {
    return new NextResponse(
      `<html>
        <head>
          <title>Access Denied - Scan Required</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FAF9F6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; color: #1e3f35; }
            .card { background: white; padding: 2.5rem; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 400px; margin: 1rem; border: 1px border #e5e7eb; }
            .icon { font-size: 3rem; margin-bottom: 1.5rem; display: block; }
            h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.5rem 0; color: #0C3125; }
            p { font-size: 0.95rem; line-height: 1.5; color: #6b7280; margin: 0 0 1.5rem 0; }
            .badge { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600; display: block; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="icon">🚨</span>
            <h1>Scan Required</h1>
            <p>For security, you can only order by physically scanning the QR code at your table.</p>
            <span class="badge">Session Blocked</span>
          </div>
        </body>
      </html>`,
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  // Parse table number from slug e.g. "table-7" → 7
  const match = tableSlug.match(/^table-(\d+)$/);
  if (!match) {
    return new NextResponse(
      "<h1>Invalid QR Code</h1><p>Please scan the QR code on your table.</p>",
      { status: 404, headers: { "Content-Type": "text/html" } }
    );
  }
  const tableNumber = parseInt(match[1], 10);

  // Look up the physical table record
  const { data: table, error: tableErr } = await supabase
    .from("tables")
    .select("id, table_number")
    .eq("table_number", tableNumber)
    .single();

  if (tableErr || !table) {
    return new NextResponse(
      "<h1>Table Not Found</h1><p>Please scan the QR code on your table.</p>",
      { status: 404, headers: { "Content-Type": "text/html" } }
    );
  }

  // Check for an existing active, non-expired session for this table
  const now = new Date().toISOString();
  const { data: existingSession } = await supabase
    .from("table_sessions")
    .select("session_token, expires_at")
    .eq("table_id", table.id)
    .eq("status", "active")
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let token: string;

  if (existingSession) {
    // Reuse the existing active session
    token = existingSession.session_token;
  } else {
    // Mint a fresh session — 15-minute expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { data: newSession, error: insertErr } = await supabaseAdmin
      .from("table_sessions")
      .insert({
        table_id: table.id,
        expires_at: expiresAt,
        status: "active",
      })
      .select("session_token")
      .single();

    if (insertErr || !newSession) {
      console.error("Failed to create table session:", insertErr);
      return new NextResponse(
        "<h1>Session Error</h1><p>Could not create a session. Please try again.</p>",
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }
    token = newSession.session_token;
  }

  // Redirect to the ordering UI and set an httpOnly cookie that must
  // match the token on every server-side validation (prevents copy-paste leaks)
  const response = NextResponse.redirect(new URL(`/order/${token}`, request.url));
  response.cookies.set("woksterrr_order_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
    sameSite: "lax",
  });

  return response;
}

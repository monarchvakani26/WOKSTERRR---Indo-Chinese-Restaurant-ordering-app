import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "build-time-placeholder-key";

// ⚠️ Admin client — SERVER-SIDE ONLY. Bypasses RLS.
// This is in a separate file so it is never imported in client components,
// avoiding errors about missing environment variables in the browser.
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

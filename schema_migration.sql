-- ============================================================
-- WOKSTERRR — Secure Session System Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add status column to table_sessions
--    Existing rows default to 'active' (they'll naturally expire via expires_at)
ALTER TABLE public.table_sessions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'expired'));

-- 2. Performance index on session_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_table_sessions_token
  ON public.table_sessions(session_token);

-- 3. Add index on (table_id, status) for admin "find active session per table" queries
CREATE INDEX IF NOT EXISTS idx_table_sessions_table_status
  ON public.table_sessions(table_id, status);

-- 4. Drop permissive anon INSERT on orders & order_items.
--    Orders are now only created via the service-role server action (bypasses RLS).
--    Anon SELECT is kept so the realtime order-status subscription still works.
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert to order_items" ON public.order_items;

-- 5. Drop anon INSERT on table_sessions too —
--    sessions are now created by the route handler using the service role key.
DROP POLICY IF EXISTS "Allow public insert to table_sessions" ON public.table_sessions;

-- Verify the migration
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'table_sessions'
ORDER BY ordinal_position;

import { supabase } from "@/lib/supabase";
import MenuClient from "./MenuClient";
import ScanInitializer from "./ScanInitializer";
import { cookies } from "next/headers";

export default async function TablePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const isScan = search.scan === 'true';
  const cookieStore = await cookies();
  const sessionCookieName = `woksterrr_session_${id}`;
  const existingToken = cookieStore.get(sessionCookieName)?.value;
  
  // Verify table
  const { data: table, error: tableErr } = await supabase
    .from('tables')
    .select('id, table_number')
    .eq('table_number', parseInt(id))
    .single();
    
  if (tableErr || !table) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Table Number</h1>
          <p className="text-gray-500">Please scan the QR code on your table again.</p>
        </div>
      </div>
    );
  }

  // 1. If scanned from physical QR code -> Generate New Session via Action
  if (isScan) {
    return <ScanInitializer tableIdString={id} tableDbId={table.id} />;
  }

  // 2. Validate existing session if not directly scanned
  if (!existingToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black">!</div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Session Missing</h2>
          <p className="text-gray-500 font-medium">For security, you can only order by physically scanning the QR code on your table.</p>
        </div>
      </div>
    );
  }

  const { data: sessionValid } = await supabase
    .from('table_sessions')
    .select('session_token, expires_at')
    .eq('session_token', existingToken)
    .eq('table_id', table.id)
    .single();

  if (!sessionValid || new Date(sessionValid.expires_at) < new Date()) {
    // Clear the invalid cookie
    cookieStore.delete(sessionCookieName);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black">!</div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Session Expired</h2>
          <p className="text-gray-500 font-medium">Your 20-minute ordering window has expired. Please scan the QR code on your table again.</p>
        </div>
      </div>
    );
  }

  // Fetch Menu
  const { data: menuItems, error: menuErr } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true);
    
  if (menuErr) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 text-red-500">
        Error loading menu. Please refresh.
      </div>
    );
  }

  return <MenuClient tableId={id} menuItems={menuItems || []} />;
}

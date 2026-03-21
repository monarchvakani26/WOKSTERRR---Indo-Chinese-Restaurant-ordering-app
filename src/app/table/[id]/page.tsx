import { supabase } from "@/lib/supabase";
import MenuClient from "./MenuClient";

// Next.js page components in app directory receive `params` as a Promise or directly?
// In Next 14/15, wait for params if it's dynamic.
export default async function TablePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  // Verify table
  const { data: table, error: tableErr } = await supabase
    .from('tables')
    .select('*')
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

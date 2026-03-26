"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createTableSession(tableIdString: string, tableDbId: string) {
  const sessionCookieName = `woksterrr_session_${tableIdString}`;
  const cookieStore = await cookies();

  const { data: sessionData, error: sessionErr } = await supabase
    .from('table_sessions')
    .insert({
      table_id: tableDbId,
      expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 mins
    })
    .select('session_token')
    .single();

  if (!sessionErr && sessionData) {
    cookieStore.set(sessionCookieName, sessionData.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 20 * 60, // 20 mins
      path: '/'
    });
    redirect(`/table/${tableIdString}`);
  }
  
  return { success: false };
}

interface OrderItem {
  id: string; // menu_item.id
  quantity: number;
}

export async function placeOrderWithSession(tableId: string | number, items: OrderItem[], total: number) {
  try {
    const tableNumber = typeof tableId === 'string' ? parseInt(tableId) : tableId;
    const sessionCookieName = `woksterrr_session_${tableNumber}`;
    const cookieStore = await cookies();
    const existingToken = cookieStore.get(sessionCookieName)?.value;

    if (!existingToken) {
      return { success: false, error: "Session missing. Please scan the QR code on your table again." };
    }

    // 1. Verify Table Exists
    const { data: tableData, error: tableErr } = await supabase
      .from('tables')
      .select('id')
      .eq('table_number', tableNumber)
      .single();

    if (tableErr || !tableData) {
      return { success: false, error: "Invalid Table." };
    }

    // 2. Strongly Verify Session
    const { data: sessionValid } = await supabase
      .from('table_sessions')
      .select('session_token, expires_at')
      .eq('session_token', existingToken)
      .eq('table_id', tableData.id)
      .single();

    if (!sessionValid || new Date(sessionValid.expires_at) < new Date()) {
      cookieStore.delete(sessionCookieName);
      return { success: false, error: "Session expired or invalid. Please scan the QR code on your table again." };
    }

    // 3. Create the Order
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert({
        table_id: tableData.id,
        status: 'pending',
        total_amount: total
      })
      .select()
      .single();

    if (orderErr || !orderData) {
      throw orderErr || new Error("Failed to create order");
    }

    // 4. Create the Order Items
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      item_id: item.id,
      quantity: item.quantity
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsErr) {
      throw itemsErr;
    }

    return { success: true, orderId: orderData.id };
  } catch (error: any) {
    console.error("Order Action Error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

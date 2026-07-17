"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface CartItem {
  id: string; // menu_item UUID
  quantity: number;
}

export async function placeOrder(sessionToken: string, cartItems: CartItem[]) {
  try {
    if (!sessionToken || !cartItems.length) {
      return { success: false, error: "Invalid request." };
    }

    // 1. Verify the httpOnly cookie matches the token in the request —
    //    this blocks copy-pasted links from other devices
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("woksterrr_order_token")?.value;
    if (!cookieToken || cookieToken !== sessionToken) {
      return {
        success: false,
        error:
          "Session mismatch. Please rescan the QR code on your table to continue ordering.",
      };
    }

    // 2. Validate session in the database (active + not expired)
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from("table_sessions")
      .select("session_token, expires_at, table_id")
      .eq("session_token", sessionToken)
      .eq("status", "active")
      .single();

    if (sessionErr || !session) {
      return {
        success: false,
        error: "Session not found. Please rescan the QR code.",
      };
    }

    if (new Date(session.expires_at) < new Date()) {
      return {
        success: false,
        error: "Session expired. Please rescan the QR code on your table.",
      };
    }

    // 3. Resolve prices server-side — never trust client-sent totals
    const itemIds = cartItems.map((i) => i.id);
    const { data: menuItems, error: menuErr } = await supabaseAdmin
      .from("menu_items")
      .select("id, price, is_available")
      .in("id", itemIds);

    if (menuErr || !menuItems) {
      return { success: false, error: "Failed to validate menu items." };
    }

    // Verify all items are available
    const unavailable = menuItems.filter((m) => !m.is_available);
    if (unavailable.length > 0) {
      return {
        success: false,
        error:
          "Some items in your cart are no longer available. Please refresh and try again.",
      };
    }

    const priceMap = new Map(menuItems.map((m) => [m.id, Number(m.price)]));
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (priceMap.get(item.id) ?? 0) * item.quantity,
      0
    );

    // 4. Insert the order — table_id comes from the validated session, NOT from client
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        table_id: session.table_id, // resolved server-side only
        status: "pending",
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (orderErr || !order) {
      throw orderErr ?? new Error("Failed to create order.");
    }

    // 5. Insert order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      item_id: item.id,
      quantity: item.quantity,
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsErr) {
      throw itemsErr;
    }

    revalidatePath("/admin");
    return { success: true, orderId: order.id as string };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("placeOrder error:", error);
    return { success: false, error: message };
  }
}

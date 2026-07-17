"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password");
  
  if (password === "woksterrr2026") {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", "true", { httpOnly: true, secure: true, path: "/" });
    redirect("/admin");
  } else {
    return { error: "Invalid password" };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/admin/login");
}

/**
 * Expires all active sessions for a given table.
 * Called from the admin Tables page when staff clear/turn over a table.
 * The next scan of the QR code will mint a fresh session automatically.
 */
export async function clearTableSession(tableId: string) {
  await supabaseAdmin
    .from("table_sessions")
    .update({ status: "expired" })
    .eq("table_id", tableId)
    .eq("status", "active");

  revalidatePath("/admin/tables");
}


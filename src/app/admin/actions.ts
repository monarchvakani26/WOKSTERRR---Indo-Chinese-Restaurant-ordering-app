"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

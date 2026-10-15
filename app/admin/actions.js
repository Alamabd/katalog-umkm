"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data.get("email")?.toString().trim();
  const password = data.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        return { error: "Email atau password salah. Silakan periksa kembali." };
      }
      return { error: error.message || "Gagal masuk. Silakan coba lagi." };
    }
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menghubungi server." };
  }

  redirect("/admin");
}

export async function keluar() {
  try {
    const supabase = await createAdminClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan error saat keluar agar tetap dialihkan ke login
  }

  redirect("/admin/login");
}

export { keluar as logout };

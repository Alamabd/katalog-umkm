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

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data.get("password_baru")?.toString();
  const konfirmasiPassword = data.get("konfirmasi_password")?.toString();

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Anda harus masuk terlebih dahulu untuk mengganti password." };
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: error.message || "Gagal mengganti password." };
    }

    return { success: "Password berhasil diganti." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat mengganti password." };
  }
}

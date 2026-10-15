"use server";

import { revalidatePath } from "next/cache";
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

function parseProdukInput(input) {
  if (!input) return {};
  if (input instanceof FormData) {
    const rawId = input.get("id")?.toString().trim();
    const nama = input.get("nama")?.toString().trim() || "";
    const rawHarga = input.get("harga")?.toString().trim();
    const kategori = input.get("kategori")?.toString().trim() || null;
    const foto_url = input.get("foto_url")?.toString().trim() || null;
    const deskripsi = input.get("deskripsi")?.toString().trim() || null;

    return {
      id: rawId && !isNaN(Number(rawId)) ? Number(rawId) : undefined,
      nama,
      harga: rawHarga !== undefined && rawHarga !== "" ? Number(rawHarga) : NaN,
      kategori,
      foto_url,
      deskripsi,
    };
  }

  if (typeof input === "object") {
    const rawId = input.id !== undefined && input.id !== null ? String(input.id).trim() : "";
    return {
      id: rawId && !isNaN(Number(rawId)) ? Number(rawId) : undefined,
      nama: typeof input.nama === "string" ? input.nama.trim() : (input.nama ?? ""),
      harga: input.harga !== undefined && input.harga !== null && input.harga !== "" ? Number(input.harga) : NaN,
      kategori: typeof input.kategori === "string" ? (input.kategori.trim() || null) : (input.kategori || null),
      foto_url: typeof input.foto_url === "string" ? (input.foto_url.trim() || null) : (input.foto_url || null),
      deskripsi: typeof input.deskripsi === "string" ? (input.deskripsi.trim() || null) : (input.deskripsi || null),
      redirect: input.redirect,
    };
  }

  return {};
}

export async function upsertProduk(arg1, arg2) {
  let input = arg1;
  if (arg2 instanceof FormData) {
    input = arg2;
  } else if (arg1 instanceof FormData) {
    input = arg1;
  }

  const isFormData = input instanceof FormData;
  const parsed = parseProdukInput(input);

  if (!parsed.nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (isNaN(parsed.harga) || parsed.harga < 0) {
    return { error: "Harga produk harus berupa angka valid dan tidak boleh negatif." };
  }

  let resultData = null;
  const isUpdate = Boolean(parsed.id);

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Anda harus masuk terlebih dahulu sebagai admin." };
    }

    const payload = {
      nama: parsed.nama,
      harga: parsed.harga,
      kategori: parsed.kategori,
      foto_url: parsed.foto_url,
      deskripsi: parsed.deskripsi,
    };

    if (isUpdate) {
      const { data, error } = await supabase
        .from("produk")
        .update(payload)
        .eq("id", parsed.id)
        .select()
        .single();

      if (error) {
        return { error: error.message || "Gagal memperbarui produk." };
      }
      resultData = data;
    } else {
      const { data, error } = await supabase
        .from("produk")
        .insert(payload)
        .select()
        .single();

      if (error) {
        return { error: error.message || "Gagal menambahkan produk." };
      }
      resultData = data;
    }

    revalidatePath("/admin");
    revalidatePath("/");
    if (parsed.id) {
      revalidatePath(`/produk/${parsed.id}`);
    } else if (resultData?.id) {
      revalidatePath(`/produk/${resultData.id}`);
    }
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menyimpan produk." };
  }

  if (isFormData || parsed.redirect === true) {
    redirect("/admin");
  }

  return { success: true, data: resultData };
}

export async function tambahProduk(arg1, arg2) {
  return upsertProduk(arg1, arg2);
}

export async function ubahProduk(arg1, arg2) {
  return upsertProduk(arg1, arg2);
}

export async function hapusProduk(arg1, arg2) {
  let id = null;
  if (arg1 instanceof FormData) {
    id = arg1.get("id");
  } else if (arg2 instanceof FormData) {
    id = arg2.get("id");
  } else if (arg1 && typeof arg1 === "object" && "id" in arg1) {
    id = arg1.id;
  } else if (typeof arg1 === "string" || typeof arg1 === "number") {
    id = arg1;
  }

  if (!id) {
    return { error: "ID produk wajib diisi." };
  }

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Anda harus masuk terlebih dahulu sebagai admin." };
    }

    const { error } = await supabase
      .from("produk")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message || "Gagal menghapus produk." };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/produk/${id}`);

    return { success: true };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menghapus produk." };
  }
}

export const deleteProduk = hapusProduk;

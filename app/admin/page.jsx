import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  const supabase = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  let daftarProduk = [];
  let errorPesan = null;

  try {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      errorPesan = error.message;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    errorPesan = err.message || "Gagal memuat produk dari database.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {errorPesan && (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
          <p className="font-semibold">Gagal memuat daftar produk</p>
          <p className="mt-1 text-teks-lembut">{errorPesan}</p>
        </div>
      )}

      <TabelProduk daftarProduk={daftarProduk} />
    </div>
  );
}

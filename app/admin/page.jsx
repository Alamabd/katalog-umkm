import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import Paginasi from "@/components/Paginasi";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 6;

export default async function HalamanAdmin({ searchParams }) {
  const supabase = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { halaman: halamanParam = "1" } = await searchParams;
  const halaman = Math.max(1, parseInt(halamanParam, 10) || 1);
  const dari = (halaman - 1) * PER_HALAMAN;
  const sampai = dari + PER_HALAMAN - 1;

  let daftarProduk = [];
  let totalProduk = 0;
  let errorPesan = null;

  try {
    const { data, error, count } = await supabase
      .from("produk")
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .range(dari, sampai);

    if (error) {
      errorPesan = error.message;
    } else {
      daftarProduk = data || [];
      totalProduk = count ?? 0;
    }
  } catch (err) {
    errorPesan = err.message || "Gagal memuat produk dari database.";
  }

  const totalHalaman = Math.ceil(totalProduk / PER_HALAMAN);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Produk</h1>
          {totalProduk > 0 && (
            <p className="mt-0.5 text-sm text-teks-lembut">
              Menampilkan {dari + 1}–{Math.min(sampai + 1, totalProduk)} dari {totalProduk} produk
            </p>
          )}
        </div>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {errorPesan && (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
          <p className="font-semibold">Gagal memuat daftar produk</p>
          <p className="mt-1 text-teks-lembut">{errorPesan}</p>
        </div>
      )}

      <TabelProduk daftarProduk={daftarProduk} />

      <Paginasi halaman={halaman} totalHalaman={totalHalaman} baseUrl="/admin?halaman=" />
    </div>
  );
}

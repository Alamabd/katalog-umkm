import { Suspense } from "react";
import KartuProduk from "@/components/KartuProduk";
import FilterProduk from "@/components/FilterProduk";
import Paginasi from "@/components/Paginasi";
import { createServerClient } from "@/lib/supabase";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 6;

export default async function HalamanKatalog({ searchParams }) {
  const { q = "", kategori = "", halaman: halamanParam = "1" } = await searchParams;

  const halaman = Math.max(1, parseInt(halamanParam, 10) || 1);
  const dari = (halaman - 1) * PER_HALAMAN;
  const sampai = dari + PER_HALAMAN - 1;

  const supabase = createServerClient();

  // Ambil semua kategori unik untuk tombol filter
  let semuaKategori = [];
  try {
    const { data } = await supabase.from("produk").select("kategori").order("kategori");
    if (data) {
      semuaKategori = [...new Set(data.map((p) => p.kategori).filter(Boolean))];
    }
  } catch {
    // Tampilkan filter tanpa pilihan kategori jika query gagal
  }

  // Ambil produk dengan filter + paginasi
  let daftarProduk = [];
  let totalProduk = 0;
  let errorPesan = null;

  try {
    let query = supabase
      .from("produk")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(dari, sampai);

    if (q) query = query.ilike("nama", `%${q}%`);
    if (kategori) query = query.eq("kategori", kategori);

    const { data, error, count } = await query;
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
  const adaFilter = q || kategori;

  // Base URL untuk Paginasi — menjaga param q dan kategori tetap aktif
  const qsPaginasi = new URLSearchParams();
  if (q) qsPaginasi.set("q", q);
  if (kategori) qsPaginasi.set("kategori", kategori);
  const baseUrl = qsPaginasi.toString()
    ? `/?${qsPaginasi.toString()}&halaman=`
    : `/?halaman=`;

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {/* FilterProduk pakai useSearchParams → wajib dibungkus Suspense */}
        <Suspense>
          <FilterProduk semuaKategori={semuaKategori} />
        </Suspense>

        {errorPesan ? (
          <div className="rounded-xl border border-garis bg-permukaan p-5 text-bahaya">
            <p className="font-semibold">Gagal memuat daftar produk</p>
            <p className="mt-1 text-sm text-teks-lembut">{errorPesan}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-xl border border-garis bg-permukaan p-6 text-center text-teks-lembut">
            {adaFilter
              ? "Tidak ada produk yang cocok. Coba kata kunci atau kategori lain."
              : "Belum ada produk."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>

            <p className="text-sm text-teks-lembut">
              Menampilkan {dari + 1}–{Math.min(sampai + 1, totalProduk)} dari {totalProduk} produk
            </p>

            <Paginasi halaman={halaman} totalHalaman={totalHalaman} baseUrl={baseUrl} />
          </>
        )}
      </section>
    </>
  );
}

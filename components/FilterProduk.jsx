"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function FilterProduk({ semuaKategori }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") || "";
  const kategoriAktif = searchParams.get("kategori") || "";

  function buatUrl(perubahan) {
    const params = new URLSearchParams(searchParams.toString());
    // Filter/pencarian berubah → kembali ke halaman 1
    params.delete("halaman");
    for (const [key, nilai] of Object.entries(perubahan)) {
      if (nilai) {
        params.set(key, nilai);
      } else {
        params.delete(key);
      }
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleKategori(kat) {
    // Klik kategori yang sama → reset filter
    const nilai = kat === kategoriAktif ? "" : kat;
    startTransition(() => router.push(buatUrl({ kategori: nilai })));
  }

  function handleCari(e) {
    e.preventDefault();
    const nilai = new FormData(e.currentTarget).get("q")?.toString().trim() || "";
    startTransition(() => router.push(buatUrl({ q: nilai })));
  }

  return (
    <div className={`flex flex-col gap-3 transition-opacity ${isPending ? "opacity-50" : ""}`}>
      {/* Pencarian */}
      <form onSubmit={handleCari} className="flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Cari nama produk..."
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
        >
          Cari
        </button>
      </form>

      {/* Filter kategori */}
      {semuaKategori.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleKategori("")}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
              !kategoriAktif
                ? "bg-utama text-white"
                : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
            }`}
          >
            Semua
          </button>
          {semuaKategori.map((kat) => (
            <button
              key={kat}
              onClick={() => handleKategori(kat)}
              className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
                kategoriAktif === kat
                  ? "bg-utama text-white"
                  : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

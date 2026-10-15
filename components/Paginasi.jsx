import Link from "next/link";

// Hasilkan array nomor halaman dengan "..." sebagai pemisah jika ada jarak.
// Contoh totalHalaman=12, halaman=6 → [1, "...", 5, 6, 7, "...", 12]
function buatRentang(halaman, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const set = new Set([1, total, halaman - 1, halaman, halaman + 1]);
  const valid = [...set]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const hasil = [];
  for (let i = 0; i < valid.length; i++) {
    if (i > 0 && valid[i] - valid[i - 1] > 1) hasil.push("...");
    hasil.push(valid[i]);
  }
  return hasil;
}

export default function Paginasi({ halaman, totalHalaman, baseUrl }) {
  if (totalHalaman <= 1) return null;

  const kelasGaris =
    "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-garis bg-latar px-3 text-sm font-semibold transition-colors hover:border-utama hover:text-utama";
  const kelasAktif =
    "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg bg-utama px-3 text-sm font-semibold text-white";
  const kelasNonaktif =
    "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-garis bg-permukaan px-3 text-sm font-semibold text-teks-lembut cursor-not-allowed";

  const rentang = buatRentang(halaman, totalHalaman);

  return (
    <nav aria-label="Paginasi" className="flex flex-wrap items-center justify-center gap-1.5">
      {halaman > 1 ? (
        <Link href={`${baseUrl}${halaman - 1}`} className={kelasGaris}>
          ← Sebelumnya
        </Link>
      ) : (
        <span className={kelasNonaktif}>← Sebelumnya</span>
      )}

      {rentang.map((item, i) =>
        item === "..." ? (
          <span key={`titik-${i}`} className="px-1 text-sm text-teks-lembut">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={`${baseUrl}${item}`}
            className={item === halaman ? kelasAktif : kelasGaris}
            aria-current={item === halaman ? "page" : undefined}
          >
            {item}
          </Link>
        )
      )}

      {halaman < totalHalaman ? (
        <Link href={`${baseUrl}${halaman + 1}`} className={kelasGaris}>
          Berikutnya →
        </Link>
      ) : (
        <span className={kelasNonaktif}>Berikutnya →</span>
      )}
    </nav>
  );
}

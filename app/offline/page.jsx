export const metadata = {
  title: "Tidak ada koneksi",
};

export default function HalamanOffline() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-6xl">📡</span>
      <h1 className="text-2xl font-extrabold">Tidak ada koneksi internet</h1>
      <p className="max-w-prose text-teks-lembut">
        Perangkat kamu sedang offline. Sambungkan ke internet, lalu muat ulang halaman.
      </p>
      <a
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap"
      >
        Coba lagi
      </a>
    </div>
  );
}

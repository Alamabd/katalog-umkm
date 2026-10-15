"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);

  const total = produk.harga * jumlah;

  const nomorBersih = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const nomor = nomorBersih.replace(/^0/, "62");
  const pesan =
    `Halo, saya ingin memesan:\n` +
    `Produk : ${produk.nama}\n` +
    `Harga  : ${formatRupiah(produk.harga)}\n` +
    `Jumlah : ${jumlah} pcs\n` +
    `Total  : ${formatRupiah(total)}`;
  const linkWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  function kurang() {
    setJumlah((j) => Math.max(1, j - 1));
  }

  function tambah() {
    setJumlah((j) => j + 1);
  }

  function handleInput(e) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) setJumlah(val);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pilih jumlah */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-teks">Jumlah</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={kurang}
            disabled={jumlah <= 1}
            aria-label="Kurangi jumlah"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-bold text-teks transition-colors hover:border-utama hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={jumlah}
            onChange={handleInput}
            aria-label="Jumlah barang"
            className="h-9 w-16 rounded-lg border border-garis bg-latar text-center text-sm font-semibold text-teks focus:border-utama focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={tambah}
            aria-label="Tambah jumlah"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-bold text-teks transition-colors hover:border-utama hover:text-utama"
          >
            +
          </button>
        </div>
      </div>

      {/* Ringkasan total */}
      <div className="flex items-center justify-between rounded-lg border border-garis bg-permukaan px-4 py-3">
        <span className="text-sm text-teks-lembut">Total pembayaran</span>
        <span className="text-lg font-extrabold text-harga">{formatRupiah(total)}</span>
      </div>

      {/* Tombol pesan */}
      <a
        href={linkWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}

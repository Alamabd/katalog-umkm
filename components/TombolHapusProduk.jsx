"use client";

import { hapusProduk } from "@/app/admin/actions";

export default function TombolHapusProduk({ id, nama }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const konfirmasi = window.confirm(
      `Hapus produk "${nama}"?\n\nTindakan ini tidak bisa dibatalkan.`
    );
    if (!konfirmasi) return;
    e.target.submit();
  }

  return (
    <form onSubmit={handleSubmit} action={hapusProduk}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-bahaya transition-colors hover:border-bahaya"
      >
        Hapus
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input, Select, Modal, EmptyState, StockPulse, formatRupiah } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";

const emptyForm = {
  sku: "", nama: "", kategori: "", warna: "", ukuran: "", supplier: "",
  modal: "", jual: "", promo: "", berat: "", rak: "", stok: "0", status: "Aktif", foto_url: "",
};

export default function ProductsPage() {
  const { employee } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [stockModal, setStockModal] = useState(null); // product being adjusted
  const [stockDelta, setStockDelta] = useState("");
  const [stockNote, setStockNote] = useState("Penyesuaian");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      sku: p.sku || "", nama: p.nama || "", kategori: p.kategori || "", warna: p.warna || "",
      ukuran: p.ukuran || "", supplier: p.supplier || "", modal: p.modal ?? "", jual: p.jual ?? "",
      promo: p.promo ?? "", berat: p.berat ?? "", rak: p.rak || "", stok: p.stok ?? "0",
      status: p.status || "Aktif", foto_url: p.foto_url || "",
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      sku: form.sku.trim(),
      nama: form.nama.trim(),
      kategori: form.kategori || null,
      warna: form.warna || null,
      ukuran: form.ukuran || null,
      supplier: form.supplier || null,
      modal: form.modal === "" ? 0 : Number(form.modal),
      jual: form.jual === "" ? 0 : Number(form.jual),
      promo: form.promo === "" ? null : Number(form.promo),
      berat: form.berat === "" ? null : Number(form.berat),
      rak: form.rak || null,
      stok: form.stok === "" ? 0 : parseInt(form.stok),
      status: form.status,
      foto_url: form.foto_url || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) alert("Gagal simpan: " + error.message);
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) alert("Gagal simpan: " + error.message);
    }
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function handleStockAdjust(e) {
    e.preventDefault();
    const delta = parseInt(stockDelta);
    if (!delta || !stockModal) return;
    const newStok = Math.max(0, (stockModal.stok || 0) + delta);
    const { error } = await supabase.from("products").update({ stok: newStok }).eq("id", stockModal.id);
    if (error) {
      alert("Gagal update stok: " + error.message);
      return;
    }
    await supabase.from("stock_history").insert({
      produk_id: stockModal.id,
      produk_nama: stockModal.nama,
      tipe: delta > 0 ? "Masuk" : "Keluar",
      qty: String(Math.abs(delta)),
      oleh: employee?.nama || "Sistem",
    });
    setStockModal(null);
    setStockDelta("");
    load();
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nama?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.kategori?.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell
      title="Produk"
      action={<Button onClick={openAdd}>+ Tambah Produk</Button>}
    >
      <Input
        placeholder="Cari nama, SKU, atau kategori..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Memuat...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-5"><EmptyState text="Belum ada produk" sub="Tap 'Tambah Produk' untuk mulai." /></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4 flex items-center gap-3">
              <div className="h-14 w-14 rounded-md2 bg-paper border border-line shrink-0 overflow-hidden flex items-center justify-center text-muted text-xs">
                {p.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.foto_url} alt={p.nama} className="h-full w-full object-cover" />
                ) : "No Foto"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink truncate">{p.nama}</p>
                <p className="text-xs text-muted truncate">{p.sku} · {p.kategori || "-"} {p.warna ? `· ${p.warna}` : ""} {p.ukuran ? `· ${p.ukuran}` : ""}</p>
                <p className="text-xs text-muted mt-0.5">{formatRupiah(p.jual)} {p.rak ? `· Rak ${p.rak}` : ""}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="stat-num font-semibold text-ink">{p.stok}</p>
                <StockPulse stok={p.stok} />
              </div>
              <div className="flex flex-col gap-1 shrink-0 ml-1">
                <Button variant="outline" className="!px-2 !py-1 text-xs" onClick={() => setStockModal(p)}>Stok</Button>
                <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => openEdit(p)}>Edit</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Produk" : "Tambah Produk"} wide>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input label="Nama Produk" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
            <Input label="Warna" value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })} />
            <Input label="Ukuran" value={form.ukuran} onChange={(e) => setForm({ ...form, ukuran: e.target.value })} />
          </div>
          <Input label="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Harga Modal" type="number" value={form.modal} onChange={(e) => setForm({ ...form, modal: e.target.value })} />
            <Input label="Harga Jual" type="number" value={form.jual} onChange={(e) => setForm({ ...form, jual: e.target.value })} />
            <Input label="Harga Promo" type="number" value={form.promo} onChange={(e) => setForm({ ...form, promo: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Berat (gram)" type="number" value={form.berat} onChange={(e) => setForm({ ...form, berat: e.target.value })} />
            <Input label="Lokasi Rak" value={form.rak} onChange={(e) => setForm({ ...form, rak: e.target.value })} />
            <Input label="Stok" type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} disabled={!!editing} />
          </div>
          {editing && <p className="text-xs text-muted -mt-2">Ubah stok lewat tombol "Stok" di daftar produk, bukan di sini.</p>}
          <Input label="URL Foto (opsional)" value={form.foto_url} onChange={(e) => setForm({ ...form, foto_url: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </Select>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>

      {/* Stock adjust modal */}
      <Modal open={!!stockModal} onClose={() => setStockModal(null)} title={`Sesuaikan Stok — ${stockModal?.nama || ""}`}>
        <form onSubmit={handleStockAdjust} className="space-y-3">
          <p className="text-sm text-muted">Stok saat ini: <span className="font-semibold text-ink">{stockModal?.stok}</span></p>
          <Input
            label="Jumlah perubahan (+masuk / -keluar)"
            type="number"
            placeholder="contoh: 10 atau -5"
            value={stockDelta}
            onChange={(e) => setStockDelta(e.target.value)}
            required
          />
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">Simpan Perubahan</Button>
            <Button type="button" variant="outline" onClick={() => setStockModal(null)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}


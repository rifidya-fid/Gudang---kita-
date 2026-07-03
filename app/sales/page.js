"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input, Select, Modal, EmptyState, formatRupiah, formatDate } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";

const MARKETPLACES = ["TikTok Shop", "Shopee", "Live TikTok", "Live Shopee", "WhatsApp", "Instagram", "Lainnya"];

const emptyForm = {
  marketplace: "TikTok Shop", customer: "", produk_id: "", qty: "1", diskon: "0", ongkir: "0",
  tanggal: new Date().toISOString().slice(0, 10),
};

function genInvoice() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${rand}`;
}

export default function SalesPage() {
  const { employee } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("sales").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("products").select("id, nama, sku, jual, stok").eq("status", "Aktif").order("nama"),
    ]);
    setSales(s || []);
    setProducts(p || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const product = products.find((p) => p.id === form.produk_id);
    if (!product) {
      alert("Pilih produk dulu.");
      return;
    }
    const qty = parseInt(form.qty || "1");
    if (qty > product.stok) {
      if (!confirm(`Stok ${product.nama} hanya ${product.stok}, tetap lanjut?`)) return;
    }
    setSaving(true);

    const { error: saleErr } = await supabase.from("sales").insert({
      invoice: genInvoice(),
      marketplace: form.marketplace,
      customer: form.customer.trim() || "Customer",
      produk_id: product.id,
      produk_nama: product.nama,
      qty,
      harga: product.jual,
      diskon: Number(form.diskon || 0),
      ongkir: Number(form.ongkir || 0),
      admin: employee?.nama || null,
      tanggal: form.tanggal,
    });

    if (saleErr) {
      alert("Gagal simpan penjualan: " + saleErr.message);
      setSaving(false);
      return;
    }

    const newStok = Math.max(0, product.stok - qty);
    await supabase.from("products").update({ stok: newStok }).eq("id", product.id);
    await supabase.from("stock_history").insert({
      produk_id: product.id,
      produk_nama: product.nama,
      tipe: "Keluar",
      qty: String(qty),
      oleh: employee?.nama || "Sistem",
    });

    // update / create customer record
    if (form.customer.trim()) {
      const { data: existing } = await supabase
        .from("customers")
        .select("*")
        .ilike("nama", form.customer.trim())
        .maybeSingle();
      const orderTotal = product.jual * qty - Number(form.diskon || 0);
      if (existing) {
        await supabase
          .from("customers")
          .update({
            total_belanja: Number(existing.total_belanja || 0) + orderTotal,
            jumlah_order: Number(existing.jumlah_order || 0) + 1,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("customers").insert({
          nama: form.customer.trim(),
          marketplace: form.marketplace,
          total_belanja: orderTotal,
          jumlah_order: 1,
        });
      }
    }

    setSaving(false);
    setModalOpen(false);
    load();
  }

  const selectedProduct = products.find((p) => p.id === form.produk_id);
  const total = selectedProduct
    ? Number(selectedProduct.jual) * parseInt(form.qty || 0) - Number(form.diskon || 0) + Number(form.ongkir || 0)
    : 0;

  return (
    <AppShell title="Penjualan" action={<Button onClick={openAdd}>+ Catat Penjualan</Button>}>
      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Memuat...</div>
      ) : sales.length === 0 ? (
        <Card className="p-5"><EmptyState text="Belum ada penjualan" sub="Tap 'Catat Penjualan' untuk mulai." /></Card>
      ) : (
        <div className="grid gap-2.5">
          {sales.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{s.produk_nama}</p>
                <p className="text-xs text-muted truncate">
                  {s.customer} · {s.marketplace} · {s.invoice}
                </p>
                <p className="text-xs text-muted mt-0.5">{formatDate(s.tanggal)} {s.admin ? `· oleh ${s.admin}` : ""}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="stat-num font-semibold text-ink">
                  {formatRupiah(s.harga * s.qty - (s.diskon || 0))}
                </p>
                <p className="text-xs text-muted">{s.qty} pcs</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Catat Penjualan" wide>
        <form onSubmit={handleSave} className="space-y-3">
          <Select label="Produk" required value={form.produk_id} onChange={(e) => setForm({ ...form, produk_id: e.target.value })}>
            <option value="">Pilih produk...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.nama} — stok {p.stok}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Marketplace" value={form.marketplace} onChange={(e) => setForm({ ...form, marketplace: e.target.value })}>
              {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
            <Input label="Nama Customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Qty" type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            <Input label="Diskon (Rp)" type="number" value={form.diskon} onChange={(e) => setForm({ ...form, diskon: e.target.value })} />
            <Input label="Ongkir (Rp)" type="number" value={form.ongkir} onChange={(e) => setForm({ ...form, ongkir: e.target.value })} />
          </div>
          <Input label="Tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />

          {selectedProduct && (
            <div className="bg-primary-light rounded-md2 px-3 py-2.5 text-sm">
              <p className="text-primary-dark font-medium">Total: {formatRupiah(total)}</p>
              <p className="text-xs text-primary-dark/70">Harga satuan {formatRupiah(selectedProduct.jual)} × {form.qty || 0} pcs</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan..." : "Simpan Penjualan"}</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}


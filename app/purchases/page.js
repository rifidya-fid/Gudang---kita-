"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input, Select, Modal, EmptyState, formatRupiah, formatDate } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";

const emptyForm = { supplier: "", produk_id: "", produk: "", qty: "1", modal: "0", ongkir: "0", pajak: "0" };

export default function PurchasesPage() {
  const { employee } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: pu }, { data: pr }, { data: su }] = await Promise.all([
      supabase.from("purchases").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("products").select("id, nama, stok").order("nama"),
      supabase.from("suppliers").select("id, nama").order("nama"),
    ]);
    setPurchases(pu || []);
    setProducts(pr || []);
    setSuppliers(su || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const product = products.find((p) => p.id === form.produk_id);
    const { error } = await supabase.from("purchases").insert({
      supplier: form.supplier.trim(),
      produk: product ? product.nama : form.produk.trim(),
      produk_id: form.produk_id || null,
      qty: parseInt(form.qty || "1"),
      modal: Number(form.modal || 0),
      ongkir: Number(form.ongkir || 0),
      pajak: Number(form.pajak || 0),
      status: "Diproses",
    });
    if (error) alert("Gagal simpan: " + error.message);
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function markReceived(purchase) {
    if (!confirm(`Tandai pembelian "${purchase.produk}" (${purchase.qty} pcs) sudah diterima? Stok akan otomatis bertambah.`)) return;
    await supabase.from("purchases").update({ status: "Diterima" }).eq("id", purchase.id);

    if (purchase.produk_id) {
      const product = products.find((p) => p.id === purchase.produk_id);
      if (product) {
        await supabase.from("products").update({ stok: (product.stok || 0) + purchase.qty }).eq("id", product.id);
        await supabase.from("stock_history").insert({
          produk_id: product.id,
          produk_nama: product.nama,
          tipe: "Masuk",
          qty: String(purchase.qty),
          oleh: employee?.nama || "Sistem",
        });
      }
    }
    load();
  }

  return (
    <AppShell title="Pembelian" action={<Button onClick={openAdd}>+ Pembelian Baru</Button>}>
      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Memuat...</div>
      ) : purchases.length === 0 ? (
        <Card className="p-5"><EmptyState text="Belum ada data pembelian" /></Card>
      ) : (
        <div className="grid gap-2.5">
          {purchases.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{p.produk}</p>
                <p className="text-xs text-muted truncate">{p.supplier} · {p.qty} pcs</p>
                <p className="text-xs text-muted mt-0.5">{formatDate(p.created_at)}</p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                <p className="stat-num font-semibold text-ink">{formatRupiah(p.modal * p.qty + p.ongkir + p.pajak)}</p>
                {p.status === "Diterima" ? (
                  <span className="text-xs font-medium text-primary-dark bg-primary-light px-2 py-0.5 rounded-full">Diterima</span>
                ) : (
                  <Button variant="outline" className="!px-2 !py-1 text-xs" onClick={() => markReceived(p)}>Tandai Diterima</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Pembelian Baru" wide>
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="Supplier"
            list="supplier-list"
            required
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
          />
          <datalist id="supplier-list">
            {suppliers.map((s) => <option key={s.id} value={s.nama} />)}
          </datalist>

          <Select label="Produk (jika sudah ada di sistem)" value={form.produk_id} onChange={(e) => setForm({ ...form, produk_id: e.target.value, produk: "" })}>
            <option value="">-- Produk baru / tidak terdaftar --</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </Select>
          {!form.produk_id && (
            <Input label="Nama Produk (baru)" value={form.produk} onChange={(e) => setForm({ ...form, produk: e.target.value })} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Qty" type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            <Input label="Harga Modal / pcs" type="number" value={form.modal} onChange={(e) => setForm({ ...form, modal: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ongkir Total" type="number" value={form.ongkir} onChange={(e) => setForm({ ...form, ongkir: e.target.value })} />
            <Input label="Pajak/Bea Masuk" type="number" value={form.pajak} onChange={(e) => setForm({ ...form, pajak: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}


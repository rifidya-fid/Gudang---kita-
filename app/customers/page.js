"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input, Modal, EmptyState, formatRupiah } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";

const emptyForm = { nama: "", hp: "", marketplace: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("customers").select("*").order("total_belanja", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("customers").insert({
      nama: form.nama.trim(),
      hp: form.hp || null,
      marketplace: form.marketplace || null,
    });
    if (error) alert("Gagal simpan: " + error.message);
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  const filtered = customers.filter((c) => c.nama?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell title="Customer" action={<Button onClick={() => setModalOpen(true)}>+ Tambah Customer</Button>}>
      <Input placeholder="Cari nama customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4" />

      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Memuat...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-5"><EmptyState text="Belum ada data customer" sub="Customer akan otomatis tercatat saat kamu mencatat penjualan." /></Card>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{c.nama}</p>
                <p className="text-xs text-muted truncate">{c.hp || "-"} {c.marketplace ? `· ${c.marketplace}` : ""}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="stat-num font-semibold text-ink">{formatRupiah(c.total_belanja)}</p>
                <p className="text-xs text-muted">{c.jumlah_order} order</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Customer">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Nama" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <Input label="No. HP" value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })} />
          <Input label="Marketplace" value={form.marketplace} onChange={(e) => setForm({ ...form, marketplace: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}


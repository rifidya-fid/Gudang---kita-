"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input, Select, Modal, EmptyState, formatRupiah, formatDate } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";

const MARKETPLACES = ["TikTok Shop", "Shopee", "Live TikTok", "Live Shopee", "WhatsApp", "Instagram", "Lainnya"];
const emptyForm = { customer: "", marketplace: "TikTok Shop", produk: "", alasan: "", kerugian: "0" };

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("returns").select("*").order("created_at", { ascending: false });
    setReturns(data || []);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("returns").insert({
      customer: form.customer.trim(),
      marketplace: form.marketplace,
      produk: form.produk.trim(),
      alasan: form.alasan.trim() || null,
      kerugian: Number(form.kerugian || 0),
    });
    if (error) alert("Gagal simpan: " + error.message);
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  return (
    <AppShell title="Retur" action={<Button onClick={() => setModalOpen(true)}>+ Catat Retur</Button>}>
      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Memuat...</div>
      ) : returns.length === 0 ? (
        <Card className="p-5"><EmptyState text="Belum ada retur" sub="Semoga terus begini 🎉" /></Card>
      ) : (
        <div className="grid gap-2.5">
          {returns.map((r) => (
            <Card key={r.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{r.produk}</p>
                <p className="text-xs text-muted truncate">{r.customer} · {r.marketplace}</p>
                {r.alasan && <p className="text-xs text-muted mt-0.5 truncate">Alasan: {r.alasan}</p>}
                <p className="text-xs text-muted mt-0.5">{formatDate(r.created_at)}</p>
              </div>
              <p className="stat-num font-semibold text-danger shrink-0">-{formatRupiah(r.kerugian)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Catat Retur">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Nama Customer" required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
          <Select label="Marketplace" value={form.marketplace} onChange={(e) => setForm({ ...form, marketplace: e.target.value })}>
            {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Input label="Nama Produk" required value={form.produk} onChange={(e) => setForm({ ...form, produk: e.target.value })} />
          <Input label="Alasan Retur" value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} />
          <Input label="Kerugian (Rp)" type="number" value={form.kerugian} onChange={(e) => setForm({ ...form, kerugian: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}


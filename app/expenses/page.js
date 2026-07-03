"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input, Select, Modal, EmptyState, StatCard, formatRupiah, formatDate } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";

const KATEGORI = ["Operasional", "Gaji", "Marketing", "Sewa Gudang", "Listrik/Internet", "Transport", "Lain-lain"];
const emptyForm = { kategori: "Operasional", jumlah: "", tanggal: new Date().toISOString().slice(0, 10) };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("expenses").select("*").order("tanggal", { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      kategori: form.kategori,
      jumlah: Number(form.jumlah || 0),
      tanggal: form.tanggal,
    });
    if (error) alert("Gagal simpan: " + error.message);
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  const thisMonth = new Date().toISOString().slice(0, 7);
  const totalBulanIni = expenses
    .filter((e) => e.tanggal?.startsWith(thisMonth))
    .reduce((a, e) => a + Number(e.jumlah), 0);

  return (
    <AppShell title="Pengeluaran" action={<Button onClick={() => setModalOpen(true)}>+ Catat Pengeluaran</Button>}>
      <div className="mb-4">
        <StatCard label="Total Bulan Ini" value={formatRupiah(totalBulanIni)} tone="warn" />
      </div>

      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Memuat...</div>
      ) : expenses.length === 0 ? (
        <Card className="p-5"><EmptyState text="Belum ada pengeluaran tercatat" /></Card>
      ) : (
        <div className="grid gap-2.5">
          {expenses.map((e) => (
            <Card key={e.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">{e.kategori}</p>
                <p className="text-xs text-muted">{formatDate(e.tanggal)}</p>
              </div>
              <p className="stat-num font-semibold text-danger">-{formatRupiah(e.jumlah)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Catat Pengeluaran">
        <form onSubmit={handleSave} className="space-y-3">
          <Select label="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
            {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
          </Select>
          <Input label="Jumlah (Rp)" type="number" required value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} />
          <Input label="Tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}


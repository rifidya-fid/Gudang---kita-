"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input, Modal, EmptyState } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";

const emptyForm = { nama: "", hp: "", negara: "Vietnam" };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
    setSuppliers(data || []);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("suppliers").insert({
      nama: form.nama.trim(),
      hp: form.hp || null,
      negara: form.negara || "Indonesia",
    });
    if (error) alert("Gagal simpan: " + error.message);
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  return (
    <AppShell title="Supplier" action={<Button onClick={() => setModalOpen(true)}>+ Tambah Supplier</Button>}>
      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Memuat...</div>
      ) : suppliers.length === 0 ? (
        <Card className="p-5"><EmptyState text="Belum ada data supplier" /></Card>
      ) : (
        <div className="grid gap-2.5">
          {suppliers.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{s.nama}</p>
                <p className="text-xs text-muted truncate">{s.hp || "-"}</p>
              </div>
              <span className="text-xs text-muted bg-paper border border-line px-2 py-1 rounded-full shrink-0">{s.negara}</span>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Supplier">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Nama Supplier" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <Input label="No. HP / WA" value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })} />
          <Input label="Negara" value={form.negara} onChange={(e) => setForm({ ...form, negara: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}


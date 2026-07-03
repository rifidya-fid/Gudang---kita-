"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input, Select, Modal, EmptyState } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";

const ROLES = ["Owner", "Admin", "Gudang", "Packing", "Host Live", "Keuangan"];

const emptyEmpForm = { nama: "", jabatan: "", hp: "", username: "", akses: "Admin", auth_user_id: "" };

export default function SettingsPage() {
  const { employee } = useAuth();
  const [tab, setTab] = useState("toko");

  const [settings, setSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [empEditing, setEmpEditing] = useState(null);
  const [empForm, setEmpForm] = useState(emptyEmpForm);
  const [savingEmp, setSavingEmp] = useState(false);

  useEffect(() => {
    loadSettings();
    loadEmployees();
  }, []);

  async function loadSettings() {
    const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
    setSettings(data);
    setSettingsForm(data);
  }

  async function loadEmployees() {
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: true });
    setEmployees(data || []);
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    const { error } = await supabase
      .from("settings")
      .update({ ...settingsForm, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
    if (error) alert("Gagal simpan: " + error.message);
    setSavingSettings(false);
    loadSettings();
  }

  function openAddEmployee() {
    setEmpEditing(null);
    setEmpForm(emptyEmpForm);
    setEmpModalOpen(true);
  }

  function openEditEmployee(e) {
    setEmpEditing(e);
    setEmpForm({
      nama: e.nama || "", jabatan: e.jabatan || "", hp: e.hp || "",
      username: e.username || "", akses: e.akses || "Admin", auth_user_id: e.auth_user_id || "",
    });
    setEmpModalOpen(true);
  }

  async function handleSaveEmployee(e) {
    e.preventDefault();
    setSavingEmp(true);
    const payload = {
      nama: empForm.nama.trim(),
      jabatan: empForm.jabatan || null,
      hp: empForm.hp || null,
      username: empForm.username.trim(),
      akses: empForm.akses,
      auth_user_id: empForm.auth_user_id.trim() || null,
    };
    let error;
    if (empEditing) {
      ({ error } = await supabase.from("employees").update(payload).eq("id", empEditing.id));
    } else {
      ({ error } = await supabase.from("employees").insert(payload));
    }
    if (error) alert("Gagal simpan: " + error.message);
    setSavingEmp(false);
    setEmpModalOpen(false);
    loadEmployees();
  }

  return (
    <AppShell title="Pengaturan">
      <div className="flex gap-2 mb-5 border-b border-line">
        {[
          { id: "toko", label: "Toko" },
          { id: "karyawan", label: "Karyawan" },
          { id: "akun", label: "Akun Saya" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-primary text-primary-dark" : "border-transparent text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "toko" && settingsForm && (
        <Card className="p-5 max-w-lg">
          <form onSubmit={handleSaveSettings} className="space-y-3">
            <Input label="Nama Toko" value={settingsForm.nama_toko || ""} onChange={(e) => setSettingsForm({ ...settingsForm, nama_toko: e.target.value })} />
            <Input label="Mata Uang" value={settingsForm.mata_uang || ""} onChange={(e) => setSettingsForm({ ...settingsForm, mata_uang: e.target.value })} />
            <Input label="Pajak" value={settingsForm.pajak || ""} onChange={(e) => setSettingsForm({ ...settingsForm, pajak: e.target.value })} />
            <Input label="Rekening Bank" value={settingsForm.rekening || ""} onChange={(e) => setSettingsForm({ ...settingsForm, rekening: e.target.value })} />
            <Input label="Printer" value={settingsForm.printer || ""} onChange={(e) => setSettingsForm({ ...settingsForm, printer: e.target.value })} />
            <Button type="submit" disabled={savingSettings}>{savingSettings ? "Menyimpan..." : "Simpan Pengaturan"}</Button>
          </form>
        </Card>
      )}

      {tab === "karyawan" && (
        <div>
          <div className="flex justify-end mb-3">
            <Button onClick={openAddEmployee}>+ Tambah Karyawan</Button>
          </div>

          <Card className="p-4 mb-4 bg-amber-light border-none">
            <p className="text-xs text-amber-dark leading-relaxed">
              <strong>Cara buatkan akun login karyawan:</strong> buka Supabase Dashboard (desktop mode) →
              Authentication → Users → Add User, isi email &amp; password karyawan. Setelah dibuat, copy
              "User UID"-nya lalu tempel di kolom <em>User ID Login</em> saat menambah/edit karyawan di sini.
              Tanpa langkah ini, karyawan belum bisa login ke aplikasi.
            </p>
          </Card>

          {employees.length === 0 ? (
            <Card className="p-5"><EmptyState text="Belum ada karyawan terdaftar" /></Card>
          ) : (
            <div className="grid gap-2.5">
              {employees.map((e) => (
                <Card key={e.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{e.nama}</p>
                    <p className="text-xs text-muted truncate">{e.jabatan || e.akses} · @{e.username}</p>
                    <p className="text-xs mt-0.5">
                      {e.auth_user_id ? (
                        <span className="text-primary-dark">● Bisa login</span>
                      ) : (
                        <span className="text-amber-dark">● Belum ada akun login</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium bg-paper border border-line px-2 py-1 rounded-full">{e.akses}</span>
                    <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => openEditEmployee(e)}>Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "akun" && (
        <Card className="p-5 max-w-lg">
          <p className="text-sm text-muted mb-1">Masuk sebagai</p>
          <p className="font-medium text-ink mb-4">{employee?.nama || "-"} ({employee?.akses || "-"})</p>
          <p className="text-sm text-muted mb-1">Username</p>
          <p className="font-medium text-ink mb-4">{employee?.username || "-"}</p>
          <p className="text-sm text-muted mb-1">Jabatan</p>
          <p className="font-medium text-ink">{employee?.jabatan || "-"}</p>
        </Card>
      )}

      <Modal open={empModalOpen} onClose={() => setEmpModalOpen(false)} title={empEditing ? "Edit Karyawan" : "Tambah Karyawan"}>
        <form onSubmit={handleSaveEmployee} className="space-y-3">
          <Input label="Nama Lengkap" required value={empForm.nama} onChange={(e) => setEmpForm({ ...empForm, nama: e.target.value })} />
          <Input label="Jabatan" value={empForm.jabatan} onChange={(e) => setEmpForm({ ...empForm, jabatan: e.target.value })} />
          <Input label="No. HP" value={empForm.hp} onChange={(e) => setEmpForm({ ...empForm, hp: e.target.value })} />
          <Input label="Username" required value={empForm.username} onChange={(e) => setEmpForm({ ...empForm, username: e.target.value })} />
          <Select label="Level Akses" value={empForm.akses} onChange={(e) => setEmpForm({ ...empForm, akses: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Input
            label="User ID Login (dari Supabase Auth, opsional)"
            value={empForm.auth_user_id}
            onChange={(e) => setEmpForm({ ...empForm, auth_user_id: e.target.value })}
            placeholder="tempel User UID di sini"
          />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={savingEmp} className="flex-1">{savingEmp ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => setEmpModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}


"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, StatCard, EmptyState, StockPulse, formatRupiah, formatDate } from "@/components/UI";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfWeek() {
  const d = startOfToday();
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - day + 1);
  return d;
}
function startOfMonth() {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [omzetHarian, setOmzetHarian] = useState(0);
  const [omzetMingguan, setOmzetMingguan] = useState(0);
  const [omzetBulanan, setOmzetBulanan] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [pengeluaranBulanIni, setPengeluaranBulanIni] = useState(0);
  const [totalProduk, setTotalProduk] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [{ data: targetData }, { data: sales }, { data: products }, { data: expenses }] =
      await Promise.all([
        supabase.from("targets").select("*").limit(1).maybeSingle(),
        supabase
          .from("sales")
          .select("*")
          .gte("tanggal", startOfMonth().toISOString().slice(0, 10))
          .order("created_at", { ascending: false }),
        supabase.from("products").select("id, stok, status").eq("status", "Aktif"),
        supabase
          .from("expenses")
          .select("jumlah, tanggal")
          .gte("tanggal", startOfMonth().toISOString().slice(0, 10)),
      ]);

    setTarget(targetData);
    setTotalProduk(products?.length || 0);

    const lineTotal = (s) => Number(s.harga) * Number(s.qty) - Number(s.diskon || 0);

    const today = startOfToday();
    const week = startOfWeek();
    const month = startOfMonth();

    let h = 0, m = 0, b = 0;
    (sales || []).forEach((s) => {
      const t = new Date(s.tanggal);
      const total = lineTotal(s);
      b += total;
      if (t >= week) m += total;
      if (t >= today) h += total;
    });
    setOmzetHarian(h);
    setOmzetMingguan(m);
    setOmzetBulanan(b);
    setRecentSales((sales || []).slice(0, 6));

    setPengeluaranBulanIni((expenses || []).reduce((a, e) => a + Number(e.jumlah), 0));

    const { data: lowStockData } = await supabase
      .from("products")
      .select("id, nama, sku, stok, foto_url")
      .eq("status", "Aktif")
      .lte("stok", 10)
      .order("stok", { ascending: true })
      .limit(6);
    setLowStock(lowStockData || []);

    setLoading(false);
  }

  const progressPct = target?.harian ? Math.min(100, Math.round((omzetHarian / target.harian) * 100)) : 0;

  return (
    <AppShell title="Dashboard">
      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Memuat data...</div>
      ) : (
        <div className="space-y-6">
          {/* Target progress — signature element */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-ink">Target Harian</p>
              <p className="text-xs text-muted">
                {formatRupiah(omzetHarian)} / {formatRupiah(target?.harian || 0)}
              </p>
            </div>
            <div className="h-2.5 rounded-full bg-line overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${progressPct >= 100 ? "bg-primary" : "bg-amber"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-2">{progressPct}% tercapai hari ini</p>
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Omzet Hari Ini" value={formatRupiah(omzetHarian)} tone="good" />
            <StatCard label="Omzet Minggu Ini" value={formatRupiah(omzetMingguan)} />
            <StatCard label="Omzet Bulan Ini" value={formatRupiah(omzetBulanan)} />
            <StatCard
              label="Pengeluaran Bulan Ini"
              value={formatRupiah(pengeluaranBulanIni)}
              tone="warn"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Low stock */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-semibold text-sm text-ink">Stok Menipis</p>
                <Link href="/products" className="text-xs text-primary font-medium">Lihat semua</Link>
              </div>
              {lowStock.length === 0 ? (
                <EmptyState text="Semua stok aman" />
              ) : (
                <ul className="space-y-2.5">
                  {lowStock.map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">{p.nama}</p>
                        <p className="text-xs text-muted">{p.sku}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="stat-num font-semibold text-ink">{p.stok}</p>
                        <StockPulse stok={p.stok} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Recent sales */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-semibold text-sm text-ink">Penjualan Terbaru</p>
                <Link href="/sales" className="text-xs text-primary font-medium">Lihat semua</Link>
              </div>
              {recentSales.length === 0 ? (
                <EmptyState text="Belum ada penjualan bulan ini" />
              ) : (
                <ul className="space-y-2.5">
                  {recentSales.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">{s.produk_nama}</p>
                        <p className="text-xs text-muted">{s.customer} · {s.marketplace}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="stat-num font-semibold text-ink">
                          {formatRupiah(s.harga * s.qty - (s.diskon || 0))}
                        </p>
                        <p className="text-xs text-muted">{formatDate(s.tanggal)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <p className="text-xs text-muted text-center">{totalProduk} produk aktif di gudang</p>
        </div>
      )}
    </AppShell>
  );
}


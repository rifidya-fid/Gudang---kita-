"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/AuthProvider";

const NAV = [
  { href: "/", label: "Dashboard", icon: IconHome },
  { href: "/products", label: "Produk", icon: IconBox },
  { href: "/sales", label: "Penjualan", icon: IconCart },
  { href: "/purchases", label: "Pembelian", icon: IconTruck },
  { href: "/returns", label: "Retur", icon: IconReturn },
  { href: "/expenses", label: "Pengeluaran", icon: IconWallet },
  { href: "/customers", label: "Customer", icon: IconUsers },
  { href: "/suppliers", label: "Supplier", icon: IconFactory },
  { href: "/settings", label: "Pengaturan", icon: IconSettings },
];

// bottom nav on mobile only shows the most-used 5
const MOBILE_NAV = ["/", "/products", "/sales", "/purchases", "/expenses"];

export default function AppShell({ children, title, action }) {
  const pathname = usePathname();
  const { employee, session, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-line bg-surface">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-line">
          <div className="h-8 w-8 rounded-md2 bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-white text-xs">GK</span>
          </div>
          <span className="font-display font-semibold text-ink">Gudang Kita</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-semibold shrink-0">
              {(employee?.nama || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{employee?.nama || "Pengguna"}</p>
              <p className="text-xs text-muted truncate">{employee?.akses || "-"}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full mt-1 text-left text-sm text-muted hover:text-danger px-2 py-1.5 rounded-md2 hover:bg-danger-light transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-60 pb-20 md:pb-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-surface border-b border-line px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md2 bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-white text-[10px]">GK</span>
            </div>
            <span className="font-display font-semibold text-ink text-sm">Gudang Kita</span>
          </div>
          <button onClick={() => setMenuOpen(true)} className="p-1.5 text-ink">
            <IconMenu />
          </button>
        </div>

        {/* Page header */}
        {title && (
          <div className="px-4 md:px-8 pt-6 pb-4 flex items-center justify-between">
            <h1 className="font-display font-bold text-xl md:text-2xl text-ink">{title}</h1>
            {action}
          </div>
        )}

        <div className="px-4 md:px-8 pb-8">{children}</div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-line flex items-stretch h-16">
        {NAV.filter((i) => MOBILE_NAV.includes(i.href)).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              <Icon className={active ? "text-primary" : "text-muted"} />
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile full menu drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="w-72 bg-surface h-full p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 text-muted">✕</button>
            </div>
            <div className="flex items-center gap-2.5 px-2 py-2 mb-2 bg-paper rounded-md2">
              <div className="h-9 w-9 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-semibold shrink-0">
                {(employee?.nama || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{employee?.nama || "Pengguna"}</p>
                <p className="text-xs text-muted truncate">{employee?.akses || "-"}</p>
              </div>
            </div>
            <nav className="space-y-0.5">
              {NAV.map((item) => (
                <div key={item.href} onClick={() => setMenuOpen(false)}>
                  <NavLink item={item} active={pathname === item.href} />
                </div>
              ))}
            </nav>
            <button
              onClick={signOut}
              className="w-full mt-3 text-left text-sm text-danger px-2 py-2 rounded-md2 hover:bg-danger-light transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ item, active }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md2 text-sm font-medium transition-colors ${
        active ? "bg-primary-light text-primary-dark" : "text-muted hover:bg-paper hover:text-ink"
      }`}
    >
      <Icon />
      {item.label}
    </Link>
  );
}

// --- Minimal inline icon set (no external icon lib needed) ---
function IconHome(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>;
}
function IconBox(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>;
}
function IconCart(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2 3h2l2.6 12.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L22 7H6" /></svg>;
}
function IconTruck(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="1" y="6" width="14" height="11" rx="1" /><path d="M15 10h4l3 3v4h-7z" /><circle cx="6" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></svg>;
}
function IconReturn(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M3 10h11a5 5 0 010 10H9" /><path d="M7 6l-4 4 4 4" /></svg>;
}
function IconWallet(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><circle cx="17" cy="15" r="1" /></svg>;
}
function IconUsers(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
}
function IconFactory(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M2 20V10l6 4v-4l6 4V6l6 4v10z" /><path d="M2 20h20" /></svg>;
}
function IconSettings(props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
}
function IconMenu(props) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M3 6h18M3 12h18M3 18h18" /></svg>;
}


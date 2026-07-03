"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-md2 bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-white text-lg">GK</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Gudang Kita</h1>
          <p className="text-muted text-sm mt-1">Masuk untuk kelola Outfitly.co</p>
        </div>

        <form onSubmit={handleLogin} className="bg-surface border border-line rounded-md2 shadow-soft p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md2 border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="nama@outfitly.co"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md2 border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger-light rounded-md2 px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium text-sm rounded-md2 py-2.5 transition-colors disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-5">
          Belum punya akun? Minta admin/owner membuatkan akun lewat menu Pengaturan → Karyawan.
        </p>
      </div>
    </div>
  );
}


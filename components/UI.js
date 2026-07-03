"use client";

export function StatCard({ label, value, sub, tone = "default" }) {
  const toneMap = {
    default: "text-ink",
    good: "text-primary-dark",
    warn: "text-amber-dark",
    bad: "text-danger",
  };
  return (
    <div className="bg-surface border border-line rounded-md2 shadow-soft p-4">
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p className={`stat-num text-2xl font-semibold mt-1.5 ${toneMap[tone]}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-surface border border-line rounded-md2 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ text, sub }) {
  return (
    <div className="text-center py-14 text-muted">
      <p className="text-sm font-medium">{text}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    outline: "border border-line text-ink hover:bg-paper",
    ghost: "text-muted hover:text-ink hover:bg-paper",
    danger: "bg-danger hover:bg-danger/90 text-white",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 text-sm font-medium rounded-md2 px-3.5 py-2 transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, className = "", ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>}
      <input
        className="w-full rounded-md2 border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        {...props}
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>}
      <select
        className="w-full rounded-md2 border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative bg-surface w-full ${wide ? "md:max-w-2xl" : "md:max-w-md"} md:rounded-md2 rounded-t-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="sticky top-0 bg-surface border-b border-line px-5 py-4 flex items-center justify-between">
          <h3 className="font-display font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink p-1">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// Signature element: stock health pulse — used across dashboard & product list
export function StockPulse({ stok, minWarn = 10 }) {
  let tone = "bg-primary";
  let text = "Aman";
  if (stok <= 0) {
    tone = "bg-danger";
    text = "Habis";
  } else if (stok <= minWarn) {
    tone = "bg-amber";
    text = "Menipis";
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${tone}`} />
      <span className="text-xs text-muted">{text}</span>
    </span>
  );
}

export function formatRupiah(n) {
  const num = Number(n || 0);
  return "Rp " + num.toLocaleString("id-ID");
}

export function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}


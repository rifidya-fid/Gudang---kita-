import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";

export const metadata = {
  title: "Gudang Kita — Outfitly.co",
  description: "Manajemen inventori, penjualan, dan keuangan Outfitly.co",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F6B5C",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-sans bg-paper text-ink antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


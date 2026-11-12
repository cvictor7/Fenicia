import type { Metadata, Viewport } from "next";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/noto-sans-phoenician/400.css";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fenícia", template: "%s · Fenícia" },
  description: "Você vende. A Fenícia organiza. Catálogo, estoque e pedidos para quem vende pelo Instagram e WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#4a1238",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}

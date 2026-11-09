import type { Metadata, Viewport } from "next";
import "@fontsource/noto-sans-phoenician/400.css";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fenícia", template: "%s · Fenícia" },
  description: "O post vira produto, a conversa vira venda.",
};

export const viewport: Viewport = {
  themeColor: "#3a0e2e",
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

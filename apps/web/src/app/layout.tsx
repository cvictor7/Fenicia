import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fenícia",
  description: "O post vira produto, a conversa vira venda.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

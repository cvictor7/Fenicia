"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSacola } from "@/lib/sacola";

/** Ícone da sacola com a quantidade, no topo da vitrine. */
export function BotaoSacola({ slug, cor }: { slug: string; cor: string }) {
  const { quantidadeTotal } = useSacola(slug);
  return (
    <Link
      href={`/${slug}/sacola`}
      aria-label={`Sacola com ${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-linha bg-white"
    >
      <ShoppingBag size={20} aria-hidden="true" />
      {quantidadeTotal > 0 ? (
        <span
          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-medium text-white"
          style={{ background: cor }}
        >
          {quantidadeTotal}
        </span>
      ) : null}
    </Link>
  );
}

export function RodapeVitrine() {
  return (
    <footer className="mt-12 pb-8 text-center text-xs text-tinta-suave">
      feito com{" "}
      <Link href="/" className="font-titulo font-semibold text-tinta">
        fenícia
      </Link>
    </footer>
  );
}

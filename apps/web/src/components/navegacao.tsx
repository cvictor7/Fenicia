"use client";

import { House, Package, Plus, ReceiptText, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { href: "/painel", rotulo: "Início", Icone: House, exato: true },
  { href: "/painel/produtos", rotulo: "Produtos", Icone: Package },
  { href: "/painel/novo-post", rotulo: "Novo post", Icone: Plus, destaque: true },
  { href: "/painel/pedidos", rotulo: "Pedidos", Icone: ReceiptText },
  { href: "/painel/loja", rotulo: "Loja", Icone: Store },
];

/** Barra de baixo do painel, ao alcance do polegar no celular. */
export function Navegacao() {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Painel"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {itens.map(({ href, rotulo, Icone, exato, destaque }) => {
          const ativo = exato ? caminho === href : caminho.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] text-tinta-suave aria-[current=page]:font-medium aria-[current=page]:text-purpura-700"
              >
                {destaque ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purpura-700 text-purpura-100">
                    <Icone size={20} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                ) : (
                  <Icone size={22} strokeWidth={ativo ? 2.2 : 1.8} aria-hidden="true" />
                )}
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

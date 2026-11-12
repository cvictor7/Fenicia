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

/** Barra de baixo, em púrpura escuro, ao alcance do polegar. */
export function Navegacao({ pedidosNovos = 0 }: { pedidosNovos?: number }) {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Painel"
      className="fixed inset-x-0 bottom-0 z-40 bg-purpura-950 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {itens.map(({ href, rotulo, Icone, exato, destaque }) => {
          const ativo = exato ? caminho === href : caminho.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className="relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] text-sobre-purpura-suave aria-[current=page]:font-semibold aria-[current=page]:text-white"
              >
                {destaque ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sobre-purpura text-purpura-700">
                    <Icone size={22} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                ) : (
                  <span className="relative">
                    <Icone size={22} strokeWidth={ativo ? 2.3 : 1.8} aria-hidden="true" />
                    {href === "/painel/pedidos" && pedidosNovos > 0 ? (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-murex px-1 text-[10px] font-bold text-purpura-950">
                        {pedidosNovos}
                      </span>
                    ) : null}
                  </span>
                )}
                {destaque ? <span className="sr-only">{rotulo}</span> : rotulo}
                {ativo && !destaque ? (
                  <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-full bg-murex" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

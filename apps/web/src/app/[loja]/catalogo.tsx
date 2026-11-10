"use client";

import { formatarCentavos } from "@fenicia/core";
import Link from "next/link";
import { useState } from "react";

type Produto = {
  id: string;
  slug: string;
  nome: string;
  categoria: string | null;
  precoMin: number;
  precoMax: number;
  disponivel: boolean;
  capa: string | null;
};

/** Grade de produtos com filtro por categoria (filtra no próprio celular, sem recarregar). */
export function Catalogo({ slug, produtos, cor }: { slug: string; produtos: Produto[]; cor: string }) {
  const categorias = [...new Set(produtos.map((p) => p.categoria).filter((c): c is string => Boolean(c)))];
  const [ativa, setAtiva] = useState<string | null>(null);
  const visiveis = ativa ? produtos.filter((p) => p.categoria === ativa) : produtos;

  return (
    <>
      {categorias.length > 1 ? (
        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1">
          {[null, ...categorias].map((c) => (
            <button
              key={c ?? "todas"}
              type="button"
              onClick={() => setAtiva(c)}
              aria-pressed={ativa === c}
              className="h-9 shrink-0 rounded-full border border-linha bg-white px-4 text-sm aria-pressed:border-transparent aria-pressed:text-white"
              style={ativa === c ? { background: cor } : undefined}
            >
              {c ?? "Tudo"}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5">
        {visiveis.map((p, i) => (
          <li key={p.id}>
            <Link href={`/${slug}/${p.slug}`} className="block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-linha/40">
                {p.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.capa}
                    alt={p.nome}
                    loading={i < 4 ? "eager" : "lazy"}
                    className={`h-full w-full object-cover ${p.disponivel ? "" : "opacity-60 grayscale"}`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-tinta-suave">Sem foto</div>
                )}
                {!p.disponivel ? (
                  <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium">Esgotado</span>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-snug">{p.nome}</p>
              <p className="mt-0.5 text-sm font-medium">
                {p.precoMin !== p.precoMax ? "a partir de " : ""}
                {formatarCentavos(p.precoMin)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

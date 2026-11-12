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

/**
 * O perfil do Instagram virando loja: categorias como "destaques" em círculo
 * e a grade de 3 colunas, cada foto com a etiqueta de preço.
 */
export function Catalogo({ slug, produtos, cor }: { slug: string; produtos: Produto[]; cor: string }) {
  const categorias = [...new Set(produtos.map((p) => p.categoria).filter((c): c is string => Boolean(c)))];
  const [ativa, setAtiva] = useState<string | null>(null);
  const visiveis = ativa ? produtos.filter((p) => p.categoria === ativa) : produtos;
  const capaDe = (c: string | null) => (c ? produtos.find((p) => p.categoria === c && p.capa)?.capa : produtos.find((p) => p.capa)?.capa);

  return (
    <>
      {categorias.length > 1 ? (
        <ul className="-mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-1" aria-label="Categorias">
          {[null, ...categorias].map((c) => {
            const marcada = ativa === c;
            const capa = capaDe(c);
            return (
              <li key={c ?? "tudo"} className="shrink-0">
                <button type="button" onClick={() => setAtiva(c)} aria-pressed={marcada} className="flex w-16 flex-col items-center gap-1.5">
                  <span
                    className="block rounded-full p-[2px]"
                    style={{ background: marcada ? cor : "var(--color-linha)" }}
                  >
                    <span className="block rounded-full border-2 border-white">
                      {capa ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={capa} alt="" className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <span className="block h-14 w-14 rounded-full bg-linha" />
                      )}
                    </span>
                  </span>
                  <span className={`w-full truncate text-center text-xs ${marcada ? "font-semibold" : ""}`}>{c ?? "Tudo"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <ul className="-mx-4 mt-5 grid grid-cols-3 gap-0.5 border-t border-linha pt-0.5">
        {visiveis.map((p, i) => (
          <li key={p.id}>
            <Link href={`/${slug}/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-linha/50" aria-label={`${p.nome}, ${formatarCentavos(p.precoMin)}${p.disponivel ? "" : ", esgotado"}`}>
              {p.capa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.capa}
                  alt=""
                  loading={i < 9 ? "eager" : "lazy"}
                  className={`h-full w-full object-cover ${p.disponivel ? "" : "opacity-50 grayscale"}`}
                />
              ) : (
                <span className="flex h-full items-center justify-center p-2 text-center text-xs text-tinta-suave">{p.nome}</span>
              )}
              {p.disponivel ? (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold tabular-nums text-tinta">
                  {p.precoMin !== p.precoMax ? "a partir " : ""}
                  {formatarCentavos(p.precoMin).replace(",00", "")}
                </span>
              ) : (
                <span className="absolute inset-x-0 bottom-1.5 text-center text-[11px] font-bold text-tinta">esgotado</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

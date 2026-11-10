"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Sacola do cliente, guardada no próprio navegador (uma por loja).
 * Guarda só o necessário para mostrar na tela; o preço de verdade é conferido no servidor.
 */
export type ItemSacola = {
  varianteId: string;
  produtoSlug: string;
  nome: string;
  variacao: string | null;
  precoUnitCentavos: number;
  capa: string | null;
  quantidade: number;
};

const ouvintes = new Set<() => void>();
const chave = (slug: string) => `fenicia:sacola:${slug}`;

function lerBruto(slug: string) {
  try {
    return localStorage.getItem(chave(slug)) ?? "[]";
  } catch {
    return "[]";
  }
}

function gravar(slug: string, itens: ItemSacola[]) {
  try {
    localStorage.setItem(chave(slug), JSON.stringify(itens));
  } catch {
    // navegador sem armazenamento (aba anônima em alguns celulares): a sacola some ao fechar
  }
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  window.addEventListener("storage", avisar);
  return () => {
    ouvintes.delete(avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function useSacola(slug: string) {
  const bruto = useSyncExternalStore(assinar, () => lerBruto(slug), () => "[]");
  const itens = useMemo<ItemSacola[]>(() => {
    try {
      const lido = JSON.parse(bruto);
      return Array.isArray(lido) ? lido : [];
    } catch {
      return [];
    }
  }, [bruto]);

  const adicionar = useCallback(
    (item: Omit<ItemSacola, "quantidade">, quantidade = 1) => {
      const atuais = JSON.parse(lerBruto(slug)) as ItemSacola[];
      const existente = atuais.find((i) => i.varianteId === item.varianteId);
      const novos = existente
        ? atuais.map((i) => (i.varianteId === item.varianteId ? { ...i, quantidade: Math.min(99, i.quantidade + quantidade) } : i))
        : [...atuais, { ...item, quantidade }];
      gravar(slug, novos);
    },
    [slug],
  );

  const mudarQuantidade = useCallback(
    (varianteId: string, quantidade: number) => {
      const atuais = JSON.parse(lerBruto(slug)) as ItemSacola[];
      gravar(
        slug,
        quantidade <= 0
          ? atuais.filter((i) => i.varianteId !== varianteId)
          : atuais.map((i) => (i.varianteId === varianteId ? { ...i, quantidade: Math.min(99, quantidade) } : i)),
      );
    },
    [slug],
  );

  const limpar = useCallback(() => gravar(slug, []), [slug]);

  const quantidadeTotal = itens.reduce((s, i) => s + i.quantidade, 0);
  const totalCentavos = itens.reduce((s, i) => s + i.quantidade * i.precoUnitCentavos, 0);

  return { itens, adicionar, mudarQuantidade, limpar, quantidadeTotal, totalCentavos };
}

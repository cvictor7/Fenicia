"use server";

import { ErroProduto, movimentarEstoque, obterBanco } from "@fenicia/db";
import { updateTag } from "next/cache";
import { obterContexto } from "@/lib/contexto";

export type ResultadoMovimento = { ok: true; estoque: number | null } | { ok: false; erro: string };

const MOTIVOS = ["entrada", "venda", "ajuste", "perda"] as const;

export async function movimentarAcao(
  varianteId: string,
  quantidade: number,
  motivo: (typeof MOTIVOS)[number],
): Promise<ResultadoMovimento> {
  const { loja, usuario } = await obterContexto();
  if (!MOTIVOS.includes(motivo)) return { ok: false, erro: "Motivo inválido." };
  try {
    const r = await movimentarEstoque(await obterBanco(), loja.id, usuario.id, varianteId, quantidade, motivo);
    updateTag(`vitrine:${loja.slug}`); // a vitrine passa a mostrar o estoque novo na hora
    return { ok: true, estoque: r.estoque };
  } catch (erro) {
    if (erro instanceof ErroProduto) return { ok: false, erro: erro.message };
    throw erro;
  }
}

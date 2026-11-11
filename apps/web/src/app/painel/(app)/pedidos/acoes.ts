"use server";

import type { StatusPedido } from "@fenicia/core";
import { ErroPedido, mudarStatusPedido, obterBanco } from "@fenicia/db";
import { revalidatePath, updateTag } from "next/cache";
import { obterContexto } from "@/lib/contexto";

export type ResultadoStatus = { ok: true } | { ok: false; erro: string };

const VALIDOS: StatusPedido[] = ["confirmado", "pago", "enviado", "entregue", "cancelado"];

export async function mudarStatusAcao(pedidoId: string, status: StatusPedido): Promise<ResultadoStatus> {
  const { loja, usuario } = await obterContexto();
  if (!VALIDOS.includes(status)) return { ok: false, erro: "Status inválido." };
  try {
    await mudarStatusPedido(await obterBanco(), loja.id, usuario.id, pedidoId, status);
  } catch (erro) {
    if (erro instanceof ErroPedido) return { ok: false, erro: erro.message };
    throw erro;
  }
  // confirmar e cancelar mexem no estoque: a vitrine precisa mostrar o número novo
  if (status === "confirmado" || status === "cancelado") updateTag(`vitrine:${loja.slug}`);
  revalidatePath("/painel/pedidos");
  revalidatePath("/painel");
  return { ok: true };
}

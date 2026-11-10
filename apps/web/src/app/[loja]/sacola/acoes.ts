"use server";

import { linkWhatsapp, montarMensagemPedido, nomeVariacao } from "@fenicia/core";
import { ErroPedido, criarPedido, lojaPorSlug, obterBanco } from "@fenicia/db";
import { z } from "zod";

export type RespostaPedido = { ok: true; numero: number; link: string } | { ok: false; erro: string };

const esquema = z.object({
  itens: z
    .array(z.object({ varianteId: z.uuid(), quantidade: z.number().int().min(1).max(99) }))
    .min(1, "A sacola está vazia.")
    .max(30),
  nome: z.string().trim().max(80),
  observacao: z.string().trim().max(500),
  // campo escondido: gente não vê nem preenche; robô de spam costuma preencher
  site: z.string().max(0),
});

/**
 * Pedido feito pela vitrine (sem login). O navegador manda só qual variação e quantas;
 * preço, nome e estoque são conferidos no banco. Devolve o link do WhatsApp com a mensagem pronta.
 */
export async function fazerPedidoAcao(slugLoja: string, entrada: unknown): Promise<RespostaPedido> {
  const lido = esquema.safeParse(entrada);
  if (!lido.success) return { ok: false, erro: lido.error.issues[0]?.message ?? "Pedido inválido." };

  const db = await obterBanco();
  const loja = await lojaPorSlug(db, slugLoja);
  if (!loja?.whatsapp) return { ok: false, erro: "Essa loja ainda não recebe pedidos pela vitrine." };

  try {
    const { pedido, itens } = await criarPedido(db, loja.id, {
      itens: lido.data.itens,
      clienteNome: lido.data.nome,
      observacao: lido.data.observacao,
    });
    const mensagem = montarMensagemPedido({
      numero: pedido.numero,
      totalCentavos: pedido.totalCentavos,
      cliente: pedido.clienteNome,
      observacao: pedido.observacao,
      itens: itens.map((i) => ({
        nome: i.nomeSnapshot,
        variacao: Object.keys(i.atributosSnapshot).length ? nomeVariacao(i.atributosSnapshot) : null,
        quantidade: i.quantidade,
        precoUnitCentavos: i.precoUnitCentavos,
      })),
    });
    return { ok: true, numero: pedido.numero, link: linkWhatsapp(loja.whatsapp, mensagem) };
  } catch (erro) {
    if (erro instanceof ErroPedido) return { ok: false, erro: erro.message };
    throw erro;
  }
}

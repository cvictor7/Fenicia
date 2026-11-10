import { nomeVariacao, totalPedido } from "@fenicia/core";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { pedido, pedidoItem, produto, variante } from "./schema";
import type { Banco } from "./tipos";

export class ErroPedido extends Error {}

export type ItemPedidoEntrada = { varianteId: string; quantidade: number };

/**
 * Cria o pedido feito pela vitrine. O preço vem SEMPRE do banco (o navegador só manda
 * qual variação e quantas). Guarda uma cópia do nome e do preço no item, para o pedido
 * continuar certo mesmo se o produto mudar depois.
 * Não baixa estoque: o lojista confirma a venda no painel.
 */
export async function criarPedido(
  db: Banco,
  lojaId: string,
  dados: { itens: ItemPedidoEntrada[]; clienteNome?: string | null; observacao?: string | null },
) {
  const pedidos = new Map<string, number>();
  for (const item of dados.itens) {
    if (!Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 99) {
      throw new ErroPedido("Quantidade inválida.");
    }
    pedidos.set(item.varianteId, (pedidos.get(item.varianteId) ?? 0) + item.quantidade);
  }
  if (pedidos.size === 0) throw new ErroPedido("A sacola está vazia.");
  if (pedidos.size > 30) throw new ErroPedido("Itens demais num pedido só.");

  const linhas = await db
    .select({
      varianteId: variante.id,
      atributos: variante.atributos,
      estoque: variante.estoque,
      precoVariante: variante.precoCentavos,
      precoProduto: produto.precoCentavos,
      nome: produto.nome,
    })
    .from(variante)
    .innerJoin(produto, eq(produto.id, variante.produtoId))
    .where(
      and(
        inArray(variante.id, [...pedidos.keys()]),
        eq(variante.lojaId, lojaId),
        eq(variante.ativo, true),
        eq(produto.status, "publicado"),
      ),
    );

  if (linhas.length !== pedidos.size) {
    throw new ErroPedido("Algum produto da sacola não está mais disponível. Confira e tente de novo.");
  }

  const itens = linhas.map((l) => {
    const quantidade = pedidos.get(l.varianteId)!;
    if (l.estoque != null && l.estoque < quantidade) {
      throw new ErroPedido(
        l.estoque === 0
          ? `${l.nome} (${nomeVariacao(l.atributos)}) acabou.`
          : `Só tem ${l.estoque} de ${l.nome} (${nomeVariacao(l.atributos)}).`,
      );
    }
    return {
      varianteId: l.varianteId,
      nomeSnapshot: l.nome,
      atributosSnapshot: l.atributos,
      precoUnitCentavos: l.precoVariante ?? l.precoProduto ?? 0,
      quantidade,
    };
  });
  const total = totalPedido(itens);

  // número sequencial por loja; se dois pedidos chegarem juntos, o índice único barra um e ele tenta de novo
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      return await db.transaction(async (tx) => {
        const [{ proximo }] = await tx
          .select({ proximo: sql<number>`coalesce(max(${pedido.numero}), 0)::int + 1` })
          .from(pedido)
          .where(eq(pedido.lojaId, lojaId));
        const [novo] = await tx
          .insert(pedido)
          .values({
            lojaId,
            numero: proximo,
            origem: "vitrine",
            clienteNome: dados.clienteNome?.trim().slice(0, 80) || null,
            observacao: dados.observacao?.trim().slice(0, 500) || null,
            totalCentavos: total,
          })
          .returning();
        await tx.insert(pedidoItem).values(itens.map((i) => ({ ...i, lojaId, pedidoId: novo.id })));
        return { pedido: novo, itens };
      });
    } catch (erro) {
      const codigo = (erro as { code?: string; cause?: { code?: string } }).code ?? (erro as { cause?: { code?: string } }).cause?.code;
      if (codigo !== "23505" || tentativa === 2) throw erro;
    }
  }
  throw new ErroPedido("Não deu para registrar o pedido.");
}

export async function listarPedidos(db: Banco, lojaId: string) {
  const pedidos = await db
    .select()
    .from(pedido)
    .where(eq(pedido.lojaId, lojaId))
    .orderBy(desc(pedido.numero))
    .limit(100);
  if (pedidos.length === 0) return [];
  const itens = await db
    .select()
    .from(pedidoItem)
    .where(inArray(pedidoItem.pedidoId, pedidos.map((p) => p.id)));
  return pedidos.map((p) => ({ ...p, itens: itens.filter((i) => i.pedidoId === p.id) }));
}

export async function contarPedidosNovos(db: Banco, lojaId: string) {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(pedido)
    .where(and(eq(pedido.lojaId, lojaId), eq(pedido.status, "novo")));
  return total;
}

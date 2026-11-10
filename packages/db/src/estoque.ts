import { and, eq, sql } from "drizzle-orm";
import { movimentoEstoque, variante } from "./schema";
import type { Banco } from "./tipos";
import { ErroProduto } from "./produtos";

type Motivo = "entrada" | "venda" | "ajuste" | "perda";

/**
 * Soma ou tira estoque de uma variação e grava no histórico, numa transação.
 * O UPDATE já confere "não fica negativo" na mesma instrução: se dois celulares
 * tirarem a última peça ao mesmo tempo, só um consegue (sem condição de corrida).
 */
export async function movimentarEstoque(
  db: Banco,
  lojaId: string,
  usuarioId: string,
  varianteId: string,
  quantidade: number,
  motivo: Motivo,
) {
  if (!Number.isInteger(quantidade) || quantidade === 0) throw new ErroProduto("Quantidade inválida.");
  if (motivo === "entrada" && quantidade < 0) throw new ErroProduto("Entrada precisa ser positiva.");
  if ((motivo === "venda" || motivo === "perda") && quantidade > 0) {
    throw new ErroProduto("Venda e perda tiram do estoque.");
  }

  return db.transaction(async (tx) => {
    const [atualizada] = await tx
      .update(variante)
      .set({ estoque: sql`coalesce(${variante.estoque}, 0) + ${quantidade}` })
      .where(
        and(
          eq(variante.id, varianteId),
          eq(variante.lojaId, lojaId),
          eq(variante.ativo, true),
          sql`coalesce(${variante.estoque}, 0) + ${quantidade} >= 0`,
        ),
      )
      .returning({ estoque: variante.estoque, produtoId: variante.produtoId });

    if (!atualizada) {
      const [existe] = await tx
        .select({ id: variante.id })
        .from(variante)
        .where(and(eq(variante.id, varianteId), eq(variante.lojaId, lojaId)));
      throw new ErroProduto(existe ? "O estoque não pode ficar negativo." : "Variação não encontrada.");
    }

    await tx.insert(movimentoEstoque).values({ lojaId, varianteId, quantidade, motivo, usuarioId });
    return atualizada;
  });
}

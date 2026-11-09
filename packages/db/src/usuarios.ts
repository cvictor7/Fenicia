import { asc, eq } from "drizzle-orm";
import { loja, membroLoja } from "./schema";
import type { Banco } from "./tipos";

type NovaLoja = Omit<typeof loja.$inferInsert, "id" | "criadoEm">;

/** Lojas em que o usuário trabalha (a primeira criada vem primeiro). */
export function lojasDoUsuario(db: Banco, usuarioId: string) {
  return db
    .select({ loja, papel: membroLoja.papel })
    .from(membroLoja)
    .innerJoin(loja, eq(loja.id, membroLoja.lojaId))
    .where(eq(membroLoja.usuarioId, usuarioId))
    .orderBy(asc(membroLoja.criadoEm));
}

export async function slugDisponivel(db: Banco, slug: string) {
  const [achado] = await db.select({ id: loja.id }).from(loja).where(eq(loja.slug, slug));
  return !achado;
}

/**
 * Cria a loja e já liga o usuário como dono, numa transação:
 * ou grava as duas coisas, ou nenhuma (não sobra loja sem dono).
 */
export function criarLojaComDono(db: Banco, usuarioId: string, dados: NovaLoja) {
  return db.transaction(async (tx) => {
    const [nova] = await tx.insert(loja).values(dados).returning();
    await tx.insert(membroLoja).values({ usuarioId, lojaId: nova.id, papel: "dono" });
    return nova;
  });
}

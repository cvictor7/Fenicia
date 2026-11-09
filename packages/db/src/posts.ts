import { and, eq } from "drizzle-orm";
import { post, type FotoEnviada } from "./schema";
import type { Banco } from "./tipos";

/** Guarda o post (fotos + legenda) antes de mandar para a IA, para nada se perder se ela falhar. */
export async function criarPost(db: Banco, lojaId: string, legenda: string, imagens: FotoEnviada[]) {
  const [novo] = await db.insert(post).values({ lojaId, legenda, imagens }).returning();
  return novo;
}

export async function registrarLeitura(
  db: Banco,
  lojaId: string,
  id: string,
  leitura: { respostaIa: unknown; modeloIa: string; erro: string | null },
) {
  await db
    .update(post)
    .set({ status: "revisar", respostaIa: leitura.respostaIa, modeloIa: leitura.modeloIa, erro: leitura.erro })
    .where(and(eq(post.lojaId, lojaId), eq(post.id, id)));
}

export async function buscarPost(db: Banco, lojaId: string, id: string) {
  const [achado] = await db.select().from(post).where(and(eq(post.lojaId, lojaId), eq(post.id, id)));
  return achado ?? null;
}

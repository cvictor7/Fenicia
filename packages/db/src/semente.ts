import { eq } from "drizzle-orm";
import { categoria, loja } from "./schema";
import type { Banco } from "./tipos";

export const SLUG_LOJA_DEMO = "loja-demo";

/**
 * Semente mínima: garante que a loja de demonstração existe.
 * Pode rodar várias vezes sem duplicar nada. A loja fictícia completa vem na etapa 11.
 */
export async function plantarSemente(db: Banco) {
  const [existente] = await db.select().from(loja).where(eq(loja.slug, SLUG_LOJA_DEMO));
  if (existente) return { criada: false, lojaId: existente.id };

  const [nova] = await db
    .insert(loja)
    .values({
      slug: SLUG_LOJA_DEMO,
      nome: "Loja Demo",
      cidade: "Manaus",
      bio: "Loja de demonstração da Fenícia.",
    })
    .returning();

  await db.insert(categoria).values([
    { lojaId: nova.id, nome: "Novidades", slug: "novidades" },
    { lojaId: nova.id, nome: "Mais vendidos", slug: "mais-vendidos" },
  ]);

  return { criada: true, lojaId: nova.id };
}

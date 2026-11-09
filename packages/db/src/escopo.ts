import { and, asc, desc, eq } from "drizzle-orm";
import { categoria, produto } from "./schema";
import type { Banco } from "./tipos";

type NovoProduto = Omit<typeof produto.$inferInsert, "id" | "lojaId">;
type MudancaProduto = Partial<Omit<NovoProduto, "lojaId">>;
type NovaCategoria = Omit<typeof categoria.$inferInsert, "id" | "lojaId">;

/**
 * Porta única de acesso aos dados de UMA loja.
 * Todo o resto do sistema chama daLoja(db, lojaId) e nunca monta consulta sem loja_id.
 * Assim, mesmo com um erro no painel, a loja A não consegue ler nem alterar dado da loja B.
 */
export function daLoja(db: Banco, lojaId: string) {
  return {
    lojaId,

    listarProdutos() {
      return db
        .select()
        .from(produto)
        .where(eq(produto.lojaId, lojaId))
        .orderBy(desc(produto.criadoEm));
    },

    async buscarProduto(id: string) {
      const [achado] = await db
        .select()
        .from(produto)
        .where(and(eq(produto.lojaId, lojaId), eq(produto.id, id)));
      return achado ?? null;
    },

    async criarProduto(dados: NovoProduto) {
      const [criado] = await db
        .insert(produto)
        .values({ ...dados, lojaId })
        .returning();
      return criado;
    },

    async atualizarProduto(id: string, dados: MudancaProduto) {
      const [atualizado] = await db
        .update(produto)
        .set({ ...dados, atualizadoEm: new Date() })
        .where(and(eq(produto.lojaId, lojaId), eq(produto.id, id)))
        .returning();
      return atualizado ?? null;
    },

    listarCategorias() {
      return db
        .select()
        .from(categoria)
        .where(eq(categoria.lojaId, lojaId))
        .orderBy(asc(categoria.nome));
    },

    async criarCategoria(dados: NovaCategoria) {
      const [criada] = await db
        .insert(categoria)
        .values({ ...dados, lojaId })
        .returning();
      return criada;
    },
  };
}

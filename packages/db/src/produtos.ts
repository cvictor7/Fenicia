import { chaveAtributos, gerarSlug, podePublicar } from "@fenicia/core";
import { and, asc, desc, eq, ilike, like, ne, or, sql } from "drizzle-orm";
import {
  categoria,
  imagemProduto,
  movimentoEstoque,
  post,
  produto,
  variante,
  type AtributosVariante,
  type FotoEnviada,
  type OpcaoProduto,
} from "./schema";
import type { Banco } from "./tipos";

export class ErroProduto extends Error {}

export type FiltroProdutos = "todos" | "publicados" | "rascunhos" | "sem-estoque" | "arquivados";

export type DadosProduto = {
  nome: string;
  descricao: string | null;
  categoriaId: string | null;
  precoCentavos: number | null;
  opcoes: OpcaoProduto[];
  status: "rascunho" | "publicado";
  variantes: { atributos: AtributosVariante; precoCentavos: number | null; estoque: number | null }[];
  /** fotos na ordem em que aparecem (a primeira é a capa); undefined = não mexer */
  imagens?: FotoEnviada[];
  /** post de onde o produto saiu ("o post vira produto") */
  postId?: string | null;
};

/** Lista com estoque somado e número de variações, para a tela de produtos. */
export async function listarProdutosResumo(
  db: Banco,
  lojaId: string,
  filtro: FiltroProdutos = "todos",
  busca = "",
) {
  const estoque = sql<number | null>`sum(${variante.estoque})::int`;
  const condicoes = [eq(produto.lojaId, lojaId)];
  if (filtro === "publicados") condicoes.push(eq(produto.status, "publicado"));
  else if (filtro === "rascunhos") condicoes.push(eq(produto.status, "rascunho"));
  else if (filtro === "arquivados") condicoes.push(eq(produto.status, "arquivado"));
  else condicoes.push(ne(produto.status, "arquivado"));
  if (busca.trim()) condicoes.push(ilike(produto.nome, `%${busca.trim()}%`));

  const consulta = db
    .select({
      id: produto.id,
      nome: produto.nome,
      status: produto.status,
      precoCentavos: produto.precoCentavos,
      atualizadoEm: produto.atualizadoEm,
      estoque,
      variacoes: sql<number>`count(${variante.id})::int`,
      capa: sql<string | null>`(select ${imagemProduto.url} from ${imagemProduto} where ${imagemProduto.produtoId} = ${produto.id} order by ${imagemProduto.ordem} limit 1)`,
    })
    .from(produto)
    .leftJoin(variante, and(eq(variante.produtoId, produto.id), eq(variante.ativo, true)))
    .where(and(...condicoes))
    .groupBy(produto.id)
    .orderBy(desc(produto.atualizadoEm));

  return filtro === "sem-estoque" ? consulta.having(sql`coalesce(sum(${variante.estoque}), -1) = 0`) : consulta;
}

/** Números do início do painel. */
export async function resumoProdutos(db: Banco, lojaId: string) {
  const todos = await listarProdutosResumo(db, lojaId);
  return {
    total: todos.length,
    publicados: todos.filter((p) => p.status === "publicado").length,
    rascunhos: todos.filter((p) => p.status === "rascunho").length,
    semEstoque: todos.filter((p) => p.estoque === 0).length,
  };
}

export async function buscarProdutoCompleto(db: Banco, lojaId: string, id: string) {
  const [achado] = await db
    .select()
    .from(produto)
    .where(and(eq(produto.lojaId, lojaId), eq(produto.id, id)));
  if (!achado) return null;
  const variantes = await db
    .select()
    .from(variante)
    .where(and(eq(variante.produtoId, id), eq(variante.ativo, true)))
    .orderBy(asc(variante.id));
  const imagens = await db
    .select()
    .from(imagemProduto)
    .where(eq(imagemProduto.produtoId, id))
    .orderBy(asc(imagemProduto.ordem));
  return { ...achado, variantes, imagens };
}

/** Link único dentro da loja: "vestido", "vestido-2", "vestido-3"... */
async function slugLivre(db: Banco, lojaId: string, nome: string) {
  let base = gerarSlug(nome) || "produto";
  // endereços que a vitrine usa para outras páginas
  if (["sacola", "pedido"].includes(base)) base = `${base}-produto`;
  const usados = await db
    .select({ slug: produto.slug })
    .from(produto)
    .where(and(eq(produto.lojaId, lojaId), or(eq(produto.slug, base), like(produto.slug, `${base}-%`))));
  const set = new Set(usados.map((u) => u.slug));
  if (!set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/**
 * Cria ou atualiza o produto com as variações, numa transação.
 * Toda mudança de estoque vira uma linha no histórico (entrada ou ajuste).
 * Variação removida não é apagada: fica inativa, para não perder o histórico.
 */
export async function salvarProduto(
  db: Banco,
  lojaId: string,
  usuarioId: string,
  dados: DadosProduto,
  id?: string,
) {
  if (dados.status === "publicado") {
    const regra = podePublicar(dados);
    if (!regra.ok) throw new ErroProduto(regra.motivo);
  }

  return db.transaction(async (tx) => {
    if (dados.categoriaId) {
      const [cat] = await tx
        .select({ id: categoria.id })
        .from(categoria)
        .where(and(eq(categoria.lojaId, lojaId), eq(categoria.id, dados.categoriaId)));
      if (!cat) throw new ErroProduto("Categoria não encontrada.");
    }

    const campos = {
      nome: dados.nome,
      descricao: dados.descricao,
      categoriaId: dados.categoriaId,
      precoCentavos: dados.precoCentavos,
      opcoes: dados.opcoes,
      status: dados.status,
    };

    let salvo: typeof produto.$inferSelect;
    if (id) {
      const [atualizado] = await tx
        .update(produto)
        .set({ ...campos, atualizadoEm: new Date() })
        .where(and(eq(produto.lojaId, lojaId), eq(produto.id, id)))
        .returning();
      if (!atualizado) throw new ErroProduto("Produto não encontrado.");
      salvo = atualizado;
    } else {
      if (dados.postId) {
        const [origem] = await tx
          .select({ id: post.id })
          .from(post)
          .where(and(eq(post.lojaId, lojaId), eq(post.id, dados.postId)));
        if (!origem) throw new ErroProduto("Post não encontrado.");
      }
      const slug = await slugLivre(tx as unknown as Banco, lojaId, dados.nome);
      [salvo] = await tx
        .insert(produto)
        .values({ ...campos, lojaId, slug, postId: dados.postId ?? null })
        .returning();
      if (dados.postId) {
        await tx.update(post).set({ status: "aprovado" }).where(eq(post.id, dados.postId));
      }
    }

    if (dados.imagens) {
      await tx.delete(imagemProduto).where(eq(imagemProduto.produtoId, salvo.id));
      if (dados.imagens.length) {
        await tx.insert(imagemProduto).values(
          dados.imagens.map((foto, ordem) => ({
            lojaId,
            produtoId: salvo.id,
            chave: foto.chave,
            url: foto.url,
            largura: foto.largura,
            altura: foto.altura,
            ordem,
          })),
        );
      }
    }

    const existentes = await tx.select().from(variante).where(eq(variante.produtoId, salvo.id));
    const porChave = new Map(existentes.map((v) => [chaveAtributos(v.atributos), v]));
    const mantidas = new Set<string>();

    for (const nova of dados.variantes) {
      const chave = chaveAtributos(nova.atributos);
      mantidas.add(chave);
      const antiga = porChave.get(chave);

      let varianteId: string;
      const estoqueAntes = antiga?.ativo ? (antiga.estoque ?? 0) : 0;
      if (antiga) {
        await tx
          .update(variante)
          .set({ precoCentavos: nova.precoCentavos, estoque: nova.estoque, ativo: true })
          .where(eq(variante.id, antiga.id));
        varianteId = antiga.id;
      } else {
        const [criada] = await tx
          .insert(variante)
          .values({
            lojaId,
            produtoId: salvo.id,
            atributos: nova.atributos,
            precoCentavos: nova.precoCentavos,
            estoque: nova.estoque,
          })
          .returning({ id: variante.id });
        varianteId = criada.id;
      }

      if (nova.estoque != null) {
        const diferenca = nova.estoque - estoqueAntes;
        if (diferenca !== 0) {
          await tx.insert(movimentoEstoque).values({
            lojaId,
            varianteId,
            quantidade: diferenca,
            motivo: antiga ? "ajuste" : "entrada",
            usuarioId,
          });
        }
      }
    }

    for (const antiga of existentes) {
      if (antiga.ativo && !mantidas.has(chaveAtributos(antiga.atributos))) {
        await tx.update(variante).set({ ativo: false }).where(eq(variante.id, antiga.id));
      }
    }

    return salvo;
  });
}

export async function arquivarProduto(db: Banco, lojaId: string, id: string) {
  const [arquivado] = await db
    .update(produto)
    .set({ status: "arquivado", atualizadoEm: new Date() })
    .where(and(eq(produto.lojaId, lojaId), eq(produto.id, id)))
    .returning({ id: produto.id });
  return Boolean(arquivado);
}

/** Usa a categoria com esse nome se já existir; senão cria. */
export async function obterOuCriarCategoria(db: Banco, lojaId: string, nome: string) {
  const slug = gerarSlug(nome);
  const [existente] = await db
    .select()
    .from(categoria)
    .where(and(eq(categoria.lojaId, lojaId), eq(categoria.slug, slug)));
  if (existente) return existente;
  const [nova] = await db.insert(categoria).values({ lojaId, nome: nome.trim(), slug }).returning();
  return nova;
}

export async function historicoEstoque(db: Banco, lojaId: string, produtoId: string) {
  return db
    .select({
      id: movimentoEstoque.id,
      quantidade: movimentoEstoque.quantidade,
      motivo: movimentoEstoque.motivo,
      criadoEm: movimentoEstoque.criadoEm,
      atributos: variante.atributos,
    })
    .from(movimentoEstoque)
    .innerJoin(variante, eq(variante.id, movimentoEstoque.varianteId))
    .where(and(eq(movimentoEstoque.lojaId, lojaId), eq(variante.produtoId, produtoId)))
    .orderBy(desc(movimentoEstoque.criadoEm));
}

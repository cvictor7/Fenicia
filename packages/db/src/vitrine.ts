import { and, asc, eq, sql } from "drizzle-orm";
import { categoria, imagemProduto, loja, produto, variante } from "./schema";
import type { Banco } from "./tipos";

/** Dados públicos da loja (nunca devolve dado interno). */
export async function lojaPorSlug(db: Banco, slug: string) {
  const [achada] = await db
    .select({
      id: loja.id,
      slug: loja.slug,
      nome: loja.nome,
      bio: loja.bio,
      whatsapp: loja.whatsapp,
      instagram: loja.instagram,
      logoUrl: loja.logoUrl,
      corDestaque: loja.corDestaque,
      cidade: loja.cidade,
    })
    .from(loja)
    .where(eq(loja.slug, slug));
  return achada ?? null;
}

const precoEfetivo = sql`coalesce(${variante.precoCentavos}, ${produto.precoCentavos})`;

/** Produtos publicados, com capa, faixa de preço e se ainda tem algo disponível. */
export async function produtosDaVitrine(db: Banco, lojaId: string) {
  return db
    .select({
      id: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      categoria: categoria.nome,
      categoriaSlug: categoria.slug,
      precoMin: sql<number>`min(${precoEfetivo})::int`,
      precoMax: sql<number>`max(${precoEfetivo})::int`,
      // estoque vazio (não informado) conta como disponível
      disponivel: sql<boolean>`bool_or(${variante.estoque} is null or ${variante.estoque} > 0)`,
      capa: sql<string | null>`(select ${imagemProduto.url} from ${imagemProduto} where ${imagemProduto.produtoId} = ${produto.id} order by ${imagemProduto.ordem} limit 1)`,
    })
    .from(produto)
    .innerJoin(variante, and(eq(variante.produtoId, produto.id), eq(variante.ativo, true)))
    .leftJoin(categoria, eq(categoria.id, produto.categoriaId))
    .where(and(eq(produto.lojaId, lojaId), eq(produto.status, "publicado")))
    .groupBy(produto.id, categoria.id)
    .orderBy(sql`${produto.atualizadoEm} desc`);
}

/** Um produto publicado, com fotos e variações (só diz se tem, não quanto tem). */
export async function produtoDaVitrine(db: Banco, lojaId: string, slug: string) {
  const [achado] = await db
    .select({
      id: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      descricao: produto.descricao,
      precoCentavos: produto.precoCentavos,
      opcoes: produto.opcoes,
    })
    .from(produto)
    .where(and(eq(produto.lojaId, lojaId), eq(produto.slug, slug), eq(produto.status, "publicado")));
  if (!achado) return null;

  const [imagens, variantes] = await Promise.all([
    db
      .select({ url: imagemProduto.url, largura: imagemProduto.largura, altura: imagemProduto.altura })
      .from(imagemProduto)
      .where(eq(imagemProduto.produtoId, achado.id))
      .orderBy(asc(imagemProduto.ordem)),
    db
      .select({ id: variante.id, atributos: variante.atributos, precoCentavos: variante.precoCentavos, estoque: variante.estoque })
      .from(variante)
      .where(and(eq(variante.produtoId, achado.id), eq(variante.ativo, true))),
  ]);

  return {
    ...achado,
    imagens,
    variantes: variantes.map((v) => ({
      id: v.id,
      atributos: v.atributos,
      precoCentavos: v.precoCentavos ?? achado.precoCentavos ?? 0,
      disponivel: v.estoque == null || v.estoque > 0,
      ultimas: v.estoque != null && v.estoque > 0 && v.estoque <= 2,
    })),
  };
}

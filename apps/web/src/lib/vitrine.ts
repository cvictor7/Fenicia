import { lojaPorSlug, obterBanco, produtoDaVitrine, produtosDaVitrine } from "@fenicia/db";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Dados da vitrine pública guardados em cache: a página abre na hora para o cliente
 * e o banco não é consultado a cada visita. Quando o lojista salva um produto ou mexe
 * no estoque, o painel chama updateTag(`vitrine:<slug>`) e o cache é refeito.
 */
export async function dadosVitrine(slug: string) {
  "use cache";
  cacheTag(`vitrine:${slug}`);
  cacheLife("hours");
  const db = await obterBanco();
  const loja = await lojaPorSlug(db, slug);
  if (!loja) return null;
  return { loja, produtos: await produtosDaVitrine(db, loja.id) };
}

export async function dadosProduto(slugLoja: string, slugProduto: string) {
  "use cache";
  cacheTag(`vitrine:${slugLoja}`);
  cacheLife("hours");
  const db = await obterBanco();
  const loja = await lojaPorSlug(db, slugLoja);
  if (!loja) return null;
  const produto = await produtoDaVitrine(db, loja.id, slugProduto);
  return produto ? { loja, produto } : null;
}

export const COR_PADRAO = "#0f6e56";

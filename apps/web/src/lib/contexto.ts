import { redirect } from "next/navigation";
import { cache } from "react";
import { exigirSessao, lojaDoUsuario } from "./sessao";

/**
 * Quem está logado e qual a loja dele. Manda para /entrar ou /criar-loja se faltar algo.
 * O cache() faz a consulta rodar uma vez só por requisição, mesmo chamada em vários componentes.
 */
export const obterContexto = cache(async () => {
  const sessao = await exigirSessao();
  const vinculo = await lojaDoUsuario(sessao.user.id);
  if (!vinculo) redirect("/painel/criar-loja");
  return { sessao, usuario: sessao.user, loja: vinculo.loja, papel: vinculo.papel };
});

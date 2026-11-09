import { lojasDoUsuario, obterBanco } from "@fenicia/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { obterAuth } from "./auth";

export async function sessaoAtual() {
  // lê os cabeçalhos primeiro: isso avisa o Next que a parte depende do pedido
  // e impede que ele tente montar a página (e abrir o banco) durante o build
  const cabecalhos = await headers();
  const auth = await obterAuth();
  return auth.api.getSession({ headers: cabecalhos });
}

/** Garante que tem alguém logado; senão manda para /entrar. */
export async function exigirSessao() {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/entrar");
  return sessao;
}

/** Primeira loja do usuário (na Fase 1 cada lojista tem uma). */
export async function lojaDoUsuario(usuarioId: string) {
  const db = await obterBanco();
  const [primeira] = await lojasDoUsuario(db, usuarioId);
  return primeira ?? null;
}

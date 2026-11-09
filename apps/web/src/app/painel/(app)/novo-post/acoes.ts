"use server";

import { criarPost, obterBanco, registrarLeitura } from "@fenicia/db";
import { redirect } from "next/navigation";
import { z } from "zod";
import { obterContexto } from "@/lib/contexto";
import { lerPost } from "@/lib/ia";
import { esquemaFotos, fotosDaLoja } from "@/lib/validar-fotos";

export type EstadoPost = { erro?: string };

const esquema = z.object({
  legenda: z.string().trim().max(2200, "Legenda longa demais (o Instagram aceita até 2.200 caracteres)."),
  fotos: esquemaFotos,
});

export async function lerPostAcao(_: EstadoPost, form: FormData): Promise<EstadoPost> {
  const { loja } = await obterContexto();
  let bruto: unknown;
  try {
    bruto = JSON.parse(String(form.get("dados") ?? "{}"));
  } catch {
    return { erro: "Não deu para ler o formulário. Recarregue a página." };
  }
  const lido = esquema.safeParse(bruto);
  if (!lido.success) return { erro: lido.error.issues[0]?.message };
  const { legenda, fotos } = lido.data;
  if (legenda.length < 3 && fotos.length === 0) {
    return { erro: "Coloque pelo menos uma foto ou a legenda do post." };
  }
  if (!fotosDaLoja(fotos, loja.id)) return { erro: "Foto inválida. Envie de novo." };

  const db = await obterBanco();
  const post = await criarPost(db, loja.id, legenda, fotos);
  const leitura = await lerPost(legenda, fotos.map((f) => f.url));
  await registrarLeitura(db, loja.id, post.id, {
    respostaIa: leitura.sugestao,
    modeloIa: leitura.modelo,
    erro: leitura.erro,
  });
  redirect(`/painel/novo-post/${post.id}`);
}

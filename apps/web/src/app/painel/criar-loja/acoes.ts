"use server";

import {
  normalizarInstagram,
  normalizarWhatsapp,
  validarSlug,
} from "@fenicia/core";
import { criarLojaComDono, obterBanco, slugDisponivel } from "@fenicia/db";
import { redirect } from "next/navigation";
import { exigirSessao, lojaDoUsuario } from "@/lib/sessao";

export type EstadoCriarLoja = {
  erro?: string;
  campos?: Partial<Record<"nome" | "slug" | "whatsapp" | "instagram", string>>;
  valores?: Record<string, string>;
};

export async function criarLoja(_: EstadoCriarLoja, form: FormData): Promise<EstadoCriarLoja> {
  const sessao = await exigirSessao();
  if (await lojaDoUsuario(sessao.user.id)) redirect("/painel");

  const valores = {
    nome: String(form.get("nome") ?? "").trim(),
    slug: String(form.get("slug") ?? "").trim().toLowerCase(),
    whatsapp: String(form.get("whatsapp") ?? "").trim(),
    instagram: String(form.get("instagram") ?? "").trim(),
  };
  const campos: NonNullable<EstadoCriarLoja["campos"]> = {};

  if (valores.nome.length < 2) campos.nome = "Digite o nome da loja.";

  const slugOk = validarSlug(valores.slug);
  if (!slugOk.ok) campos.slug = slugOk.motivo;

  const whatsapp = normalizarWhatsapp(valores.whatsapp);
  if (!whatsapp) campos.whatsapp = "Digite o WhatsApp com DDD, ex.: (92) 98416-3597.";

  const instagram = valores.instagram ? normalizarInstagram(valores.instagram) : null;
  if (valores.instagram && !instagram) campos.instagram = "Digite só o @ da loja.";

  if (Object.keys(campos).length) return { campos, valores };

  const db = await obterBanco();
  if (!(await slugDisponivel(db, valores.slug))) {
    return { campos: { slug: "Esse link já está em uso. Tente outro." }, valores };
  }

  try {
    await criarLojaComDono(db, sessao.user.id, {
      nome: valores.nome,
      slug: valores.slug,
      whatsapp,
      instagram,
    });
  } catch {
    return { erro: "Não deu para criar a loja agora. Tente de novo.", valores };
  }
  redirect("/painel");
}

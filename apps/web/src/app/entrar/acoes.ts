"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { obterAuth } from "@/lib/auth";

export type EstadoAcesso = {
  erro?: string;
  campos?: Partial<Record<"nome" | "email" | "senha", string>>;
  valores?: { nome?: string; email?: string };
};

const esquemaEntrar = z.object({
  email: z.email("Digite um e-mail válido."),
  senha: z.string().min(1, "Digite sua senha."),
});

const esquemaCriar = z.object({
  nome: z.string().trim().min(2, "Digite seu nome."),
  email: z.email("Digite um e-mail válido."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

function errosDosCampos(erro: z.ZodError): EstadoAcesso["campos"] {
  const campos: EstadoAcesso["campos"] = {};
  for (const problema of erro.issues) {
    const nome = problema.path[0] as keyof NonNullable<EstadoAcesso["campos"]>;
    campos[nome] ??= problema.message;
  }
  return campos;
}

export async function entrar(_: EstadoAcesso, form: FormData): Promise<EstadoAcesso> {
  const dados = esquemaEntrar.safeParse({ email: form.get("email"), senha: form.get("senha") });
  const valores = { email: String(form.get("email") ?? "") };
  if (!dados.success) return { campos: errosDosCampos(dados.error), valores };

  try {
    const auth = await obterAuth();
    await auth.api.signInEmail({
      body: { email: dados.data.email, password: dados.data.senha },
      headers: await headers(),
    });
  } catch (erro) {
    if (erro instanceof APIError) return { erro: "E-mail ou senha incorretos.", valores };
    throw erro;
  }
  redirect("/painel");
}

export async function criarConta(_: EstadoAcesso, form: FormData): Promise<EstadoAcesso> {
  const dados = esquemaCriar.safeParse({
    nome: form.get("nome"),
    email: form.get("email"),
    senha: form.get("senha"),
  });
  const valores = { nome: String(form.get("nome") ?? ""), email: String(form.get("email") ?? "") };
  if (!dados.success) return { campos: errosDosCampos(dados.error), valores };

  try {
    const auth = await obterAuth();
    await auth.api.signUpEmail({
      body: { name: dados.data.nome, email: dados.data.email, password: dados.data.senha },
      headers: await headers(),
    });
  } catch (erro) {
    if (erro instanceof APIError) {
      return { erro: "Já existe uma conta com esse e-mail. Entre com ela.", valores };
    }
    throw erro;
  }
  redirect("/painel/criar-loja");
}

export async function sair() {
  const auth = await obterAuth();
  await auth.api.signOut({ headers: await headers() });
  redirect("/entrar");
}

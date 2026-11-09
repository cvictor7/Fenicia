"use server";

import {
  chaveAtributos,
  combinarOpcoes,
  converterPrecoDigitado,
  nomeVariacao,
  podePublicar,
  validarOpcoes,
} from "@fenicia/core";
import {
  ErroProduto,
  arquivarProduto,
  obterBanco,
  obterOuCriarCategoria,
  salvarProduto,
} from "@fenicia/db";
import { redirect } from "next/navigation";
import { z } from "zod";
import { obterContexto } from "@/lib/contexto";
import { esquemaFotos, fotosDaLoja } from "@/lib/validar-fotos";

export type EstadoEditor = {
  erro?: string;
  campos?: Partial<Record<"nome" | "preco" | "variacoes", string>>;
};

const esquema = z.object({
  nome: z.string().trim().min(2, "Digite o nome do produto.").max(120, "Nome longo demais."),
  descricao: z.string().trim().max(2000, "Descrição longa demais."),
  categoriaId: z.string(),
  novaCategoria: z.string().trim().max(40),
  preco: z.string(),
  temVariacoes: z.boolean(),
  opcoes: z
    .array(z.object({ nome: z.string().trim().max(30), valores: z.array(z.string().trim().min(1).max(30)) }))
    .max(5),
  linhas: z.record(z.string(), z.object({ estoque: z.string(), preco: z.string() })),
  fotos: esquemaFotos,
});

export type DadosEditor = z.infer<typeof esquema>;

export async function salvarProdutoAcao(
  id: string | null,
  postId: string | null,
  _: EstadoEditor,
  form: FormData,
): Promise<EstadoEditor> {
  const { loja, usuario } = await obterContexto();

  let bruto: unknown;
  try {
    bruto = JSON.parse(String(form.get("dados") ?? "{}"));
  } catch {
    return { erro: "Não deu para ler o formulário. Recarregue a página." };
  }
  const lido = esquema.safeParse(bruto);
  if (!lido.success) {
    const primeiro = lido.error.issues[0];
    return primeiro?.path[0] === "nome" ? { campos: { nome: primeiro.message } } : { erro: primeiro?.message };
  }
  const dados = lido.data;
  const publicar = form.get("intencao") === "publicar";
  if (!fotosDaLoja(dados.fotos, loja.id)) return { erro: "Foto inválida. Envie de novo." };

  const preco = converterPrecoDigitado(dados.preco);
  if (preco === undefined) return { campos: { preco: "Digite o preço assim: 89,90" } };
  if (publicar) {
    const regra = podePublicar({ precoCentavos: preco });
    if (!regra.ok) return { campos: { preco: regra.motivo } };
  }

  const opcoes = dados.temVariacoes ? dados.opcoes : [];
  const erroOpcoes = validarOpcoes(opcoes);
  if (erroOpcoes) return { campos: { variacoes: erroOpcoes } };

  // o servidor refaz as combinações: não confia na lista que veio do navegador
  const variantes = [];
  for (const atributos of combinarOpcoes(opcoes)) {
    const linha = dados.linhas[chaveAtributos(atributos)] ?? { estoque: "", preco: "" };
    const textoEstoque = linha.estoque.trim();
    const estoque = textoEstoque === "" ? null : Number(textoEstoque);
    if (estoque != null && (!Number.isInteger(estoque) || estoque < 0 || estoque > 99999)) {
      return { campos: { variacoes: `Estoque inválido em "${nomeVariacao(atributos)}".` } };
    }
    const precoVariacao = converterPrecoDigitado(linha.preco);
    if (precoVariacao === undefined) {
      return { campos: { variacoes: `Preço inválido em "${nomeVariacao(atributos)}".` } };
    }
    variantes.push({ atributos, estoque, precoCentavos: precoVariacao });
  }

  const db = await obterBanco();
  try {
    let categoriaId: string | null = dados.categoriaId || null;
    if (dados.categoriaId === "nova" && dados.novaCategoria) {
      categoriaId = (await obterOuCriarCategoria(db, loja.id, dados.novaCategoria)).id;
    } else if (dados.categoriaId === "nova") {
      categoriaId = null;
    }

    await salvarProduto(
      db,
      loja.id,
      usuario.id,
      {
        nome: dados.nome,
        descricao: dados.descricao || null,
        categoriaId,
        precoCentavos: preco,
        opcoes: opcoes.map((o) => ({ nome: o.nome.trim(), valores: o.valores })),
        status: publicar ? "publicado" : "rascunho",
        variantes,
        imagens: dados.fotos,
        postId: id ? undefined : postId,
      },
      id ?? undefined,
    );
  } catch (erro) {
    if (erro instanceof ErroProduto) return { erro: erro.message };
    throw erro;
  }
  redirect("/painel/produtos");
}

export async function arquivarProdutoAcao(id: string) {
  const { loja } = await obterContexto();
  await arquivarProduto(await obterBanco(), loja.id, id);
  redirect("/painel/produtos");
}

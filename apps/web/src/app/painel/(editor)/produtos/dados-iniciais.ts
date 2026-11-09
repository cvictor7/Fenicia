import { centavosParaCampo, chaveAtributos, type SugestaoConferida } from "@fenicia/core";
import type { buscarProdutoCompleto } from "@fenicia/db";
import type { DadosEditor } from "./acoes";

type ProdutoCompleto = NonNullable<Awaited<ReturnType<typeof buscarProdutoCompleto>>>;

export const editorVazio: DadosEditor = {
  nome: "",
  descricao: "",
  categoriaId: "",
  novaCategoria: "",
  preco: "",
  temVariacoes: false,
  opcoes: [],
  linhas: {},
  fotos: [],
};

/** Converte o produto do banco no formato do formulário. */
export function paraEditor(p: ProdutoCompleto): DadosEditor {
  const linhas: DadosEditor["linhas"] = {};
  for (const v of p.variantes) {
    linhas[chaveAtributos(v.atributos)] = {
      estoque: v.estoque == null ? "" : String(v.estoque),
      preco: centavosParaCampo(v.precoCentavos),
    };
  }
  return {
    nome: p.nome,
    descricao: p.descricao ?? "",
    categoriaId: p.categoriaId ?? "",
    novaCategoria: "",
    preco: centavosParaCampo(p.precoCentavos),
    temVariacoes: p.opcoes.length > 0,
    opcoes: p.opcoes,
    linhas,
    fotos: p.imagens.map(({ url, chave, largura, altura }) => ({ url, chave, largura, altura })),
  };
}

/** Monta o formulário a partir do que a IA (ou a leitura simples) sugeriu. Estoque fica sempre vazio. */
export function deSugestao(
  sugestao: SugestaoConferida,
  fotos: DadosEditor["fotos"],
  categorias: { id: string; nome: string }[],
): DadosEditor {
  const existente = sugestao.categoria
    ? categorias.find((c) => c.nome.toLowerCase() === sugestao.categoria!.toLowerCase())
    : undefined;
  return {
    nome: sugestao.nome ?? "",
    descricao: sugestao.descricao ?? "",
    categoriaId: existente ? existente.id : sugestao.categoria ? "nova" : "",
    novaCategoria: existente ? "" : (sugestao.categoria ?? ""),
    preco: centavosParaCampo(sugestao.precoCentavos),
    temVariacoes: sugestao.opcoes.length > 0,
    opcoes: sugestao.opcoes,
    linhas: {},
    fotos,
  };
}

import { centavosParaCampo, chaveAtributos } from "@fenicia/core";
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
  };
}

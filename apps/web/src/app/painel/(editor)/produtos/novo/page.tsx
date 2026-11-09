import { daLoja, obterBanco } from "@fenicia/db";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";
import { editorVazio } from "../dados-iniciais";
import { EditorProduto } from "../editor";

export const metadata: Metadata = { title: "Novo produto" };

async function Novo() {
  const { loja } = await obterContexto();
  const categorias = await daLoja(await obterBanco(), loja.id).listarCategorias();
  return (
    <EditorProduto
      id={null}
      inicial={editorVazio}
      categorias={categorias.map(({ id, nome }) => ({ id, nome }))}
    />
  );
}

export default function PaginaNovoProduto() {
  return (
    <Suspense fallback={<Carregando />}>
      <Novo />
    </Suspense>
  );
}

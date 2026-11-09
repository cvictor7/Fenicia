import { buscarProdutoCompleto, daLoja, obterBanco } from "@fenicia/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";
import { paraEditor } from "../dados-iniciais";
import { EditorProduto } from "../editor";

export const metadata: Metadata = { title: "Editar produto" };

type Params = Promise<{ id: string }>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Editar({ params }: { params: Params }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { loja } = await obterContexto();
  const db = await obterBanco();
  const [produto, categorias] = await Promise.all([
    buscarProdutoCompleto(db, loja.id, id),
    daLoja(db, loja.id).listarCategorias(),
  ]);
  if (!produto) notFound();
  return (
    <EditorProduto
      id={produto.id}
      inicial={paraEditor(produto)}
      publicado={produto.status === "publicado"}
      categorias={categorias.map(({ id, nome }) => ({ id, nome }))}
    />
  );
}

export default function PaginaEditarProduto({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Carregando />}>
      <Editar params={params} />
    </Suspense>
  );
}

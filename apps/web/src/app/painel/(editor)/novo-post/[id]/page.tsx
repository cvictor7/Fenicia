import type { SugestaoConferida } from "@fenicia/core";
import { buscarPost, daLoja, obterBanco } from "@fenicia/db";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando, Vazio } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";
import { deSugestao } from "../../produtos/dados-iniciais";
import { EditorProduto } from "../../produtos/editor";
import { PainelLeitura } from "./painel-leitura";

export const metadata: Metadata = { title: "Confira o produto" };

type Params = Promise<{ id: string }>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Revisao({ params }: { params: Params }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { loja } = await obterContexto();
  const db = await obterBanco();
  const [post, categorias] = await Promise.all([
    buscarPost(db, loja.id, id),
    daLoja(db, loja.id).listarCategorias(),
  ]);
  if (!post) notFound();

  if (post.status === "aprovado") {
    return (
      <Vazio titulo="Esse post já virou produto" texto="Ele está na sua lista de produtos.">
        <Link href="/painel/produtos" className="inline-flex h-11 items-center rounded-xl bg-purpura-700 px-5 font-medium text-purpura-100">
          Ver produtos
        </Link>
      </Vazio>
    );
  }

  const sugestao = (post.respostaIa ?? {
    nome: null, categoria: null, descricao: null, precoCentavos: null, opcoes: [],
    trechoPreco: null, precoDescartado: false,
  }) as SugestaoConferida;
  const listaCategorias = categorias.map(({ id, nome }) => ({ id, nome }));

  return (
    <EditorProduto
      id={null}
      postId={post.id}
      categorias={listaCategorias}
      inicial={deSugestao(sugestao, post.imagens, listaCategorias)}
      topo={<PainelLeitura legenda={post.legenda} sugestao={sugestao} modelo={post.modeloIa ?? ""} />}
    />
  );
}

export default function PaginaRevisao({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Carregando />}>
      <Revisao params={params} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotaoSacola } from "@/components/vitrine";
import { COR_PADRAO, dadosProduto } from "@/lib/vitrine";
import { Compra } from "./compra";

type Params = Promise<{ loja: string; produto: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { loja, produto } = await params;
  const dados = await dadosProduto(loja, produto);
  if (!dados) return { title: "Produto não encontrado" };
  const capa = dados.produto.imagens[0]?.url;
  return {
    title: { absolute: `${dados.produto.nome} · ${dados.loja.nome}` },
    description: dados.produto.descricao ?? undefined,
    openGraph: {
      title: dados.produto.nome,
      description: dados.produto.descricao ?? undefined,
      images: capa && !capa.startsWith("data:") ? [capa] : undefined,
    },
  };
}

async function Produto({ params }: { params: Params }) {
  const { loja: slugLoja, produto: slugProduto } = await params;
  const dados = await dadosProduto(slugLoja, slugProduto);
  if (!dados) notFound();
  const { loja, produto } = dados;
  const cor = loja.corDestaque ?? COR_PADRAO;

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href={`/${loja.slug}`} className="-ml-2 flex h-10 items-center gap-1 rounded-xl px-2 text-sm font-medium">
          <ArrowLeft size={18} aria-hidden="true" /> {loja.nome}
        </Link>
        <BotaoSacola slug={loja.slug} cor={cor} />
      </div>

      {produto.imagens.length ? (
        <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4">
          {produto.imagens.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.url}
              src={img.url}
              alt={`${produto.nome}, foto ${i + 1} de ${produto.imagens.length}`}
              className="aspect-[4/5] w-[88%] shrink-0 snap-center rounded-2xl object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>
      ) : null}

      <h1 className="mt-5 font-titulo text-2xl font-semibold leading-tight tracking-tight">{produto.nome}</h1>
      <Compra
        slugLoja={loja.slug}
        whatsapp={loja.whatsapp}
        cor={cor}
        produto={{
          slug: produto.slug,
          nome: produto.nome,
          opcoes: produto.opcoes,
          variantes: produto.variantes,
          capa: produto.imagens[0]?.url ?? null,
        }}
      />
      {produto.descricao ? (
        <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-tinta">{produto.descricao}</p>
      ) : null}
    </>
  );
}

export default function PaginaProduto({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-4">
      <Suspense fallback={<div className="mt-10 aspect-[4/5] animate-pulse rounded-2xl bg-linha/40" />}>
        <Produto params={params} />
      </Suspense>
    </main>
  );
}

import { linkWhatsapp } from "@fenicia/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotaoSacola, RodapeVitrine } from "@/components/vitrine";
import { COR_PADRAO, dadosVitrine } from "@/lib/vitrine";
import { Catalogo } from "./catalogo";

type Params = Promise<{ loja: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { loja: slug } = await params;
  const dados = await dadosVitrine(slug);
  if (!dados) return { title: "Loja não encontrada" };
  const capa = dados.produtos.find((p) => p.capa)?.capa;
  const descricao = dados.loja.bio ?? `Veja os produtos da ${dados.loja.nome} e peça pelo WhatsApp.`;
  return {
    title: { absolute: dados.loja.nome },
    description: descricao,
    openGraph: {
      title: dados.loja.nome,
      description: descricao,
      images: capa && !capa.startsWith("data:") ? [capa] : undefined,
    },
  };
}

async function Vitrine({ params }: { params: Params }) {
  const { loja: slug } = await params;
  const dados = await dadosVitrine(slug);
  if (!dados) notFound();
  const { loja, produtos } = dados;
  const cor = loja.corDestaque ?? COR_PADRAO;
  const inicial = loja.nome.trim().charAt(0).toUpperCase();

  return (
    <>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {loja.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={loja.logoUrl} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-titulo text-2xl font-semibold text-white"
              style={{ background: cor }}
            >
              {inicial}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-titulo text-2xl font-semibold tracking-tight">{loja.nome}</h1>
            {loja.cidade ? <p className="text-sm text-tinta-suave">{loja.cidade}</p> : null}
          </div>
        </div>
        <BotaoSacola slug={loja.slug} cor={cor} />
      </header>

      {loja.bio ? <p className="mt-3 text-[15px] leading-relaxed">{loja.bio}</p> : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {loja.whatsapp ? (
          <a
            href={linkWhatsapp(loja.whatsapp, `Oi! Vim pela vitrine da ${loja.nome}.`)}
            className="flex h-11 items-center justify-center rounded-xl font-medium text-white"
            style={{ background: cor }}
          >
            WhatsApp
          </a>
        ) : null}
        {loja.instagram ? (
          <a
            href={`https://instagram.com/${loja.instagram}`}
            className="flex h-11 items-center justify-center rounded-xl border border-linha bg-white font-medium"
          >
            @{loja.instagram}
          </a>
        ) : null}
      </div>

      {produtos.length === 0 ? (
        <p className="mt-10 text-center text-tinta-suave">Nenhum produto por aqui ainda. Volte logo!</p>
      ) : (
        <Catalogo slug={loja.slug} produtos={produtos} cor={cor} />
      )}
      <RodapeVitrine />
    </>
  );
}

export default function PaginaVitrine({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-md bg-areia px-4 pt-6">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-linha/40" />}>
        <Vitrine params={params} />
      </Suspense>
    </main>
  );
}

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
      <div className="flex justify-end">
        <BotaoSacola slug={loja.slug} cor={cor} />
      </div>
      <header className="-mt-2 flex items-center gap-5">
        <span className="shrink-0 rounded-full p-[3px]" style={{ background: cor }}>
          <span className="block rounded-full border-[3px] border-white">
            {loja.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={loja.logoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-20 w-20 items-center justify-center rounded-full font-titulo text-3xl font-bold text-white"
                style={{ background: cor }}
              >
                {inicial}
              </span>
            )}
          </span>
        </span>
        <div className="min-w-0">
          <h1 className="font-titulo text-2xl font-bold leading-tight tracking-tight">{loja.nome}</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            <b className="font-semibold text-tinta">{produtos.length}</b> {produtos.length === 1 ? "produto" : "produtos"}
            {loja.cidade ? <> em {loja.cidade}</> : null}
          </p>
        </div>
      </header>

      {loja.bio ? <p className="mt-4 text-[15px] leading-relaxed">{loja.bio}</p> : null}

      <div className="mt-4 flex gap-2">
        {loja.whatsapp ? (
          <a
            href={linkWhatsapp(loja.whatsapp, `Oi! Vim pela vitrine da ${loja.nome}.`)}
            className="flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ background: cor }}
          >
            Chamar no WhatsApp
          </a>
        ) : null}
        {loja.instagram ? (
          <a
            href={`https://instagram.com/${loja.instagram}`}
            className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#efefef] text-sm font-semibold"
          >
            @{loja.instagram}
          </a>
        ) : null}
      </div>

      {produtos.length === 0 ? (
        <p className="mt-10 border-t border-linha pt-10 text-center text-tinta-suave">Os produtos aparecem aqui assim que a loja publicar.</p>
      ) : (
        <Catalogo slug={loja.slug} produtos={produtos} cor={cor} />
      )}
      <RodapeVitrine />
    </>
  );
}

export default function PaginaVitrine({ params }: { params: Params }) {
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-white px-4 pt-4">
      <Suspense fallback={<div className="mt-12 flex items-center gap-5"><span className="h-[92px] w-[92px] animate-pulse rounded-full bg-linha" /><span className="h-6 w-40 animate-pulse rounded bg-linha" /></div>}>
        <Vitrine params={params} />
      </Suspense>
    </main>
  );
}

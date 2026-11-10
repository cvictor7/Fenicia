import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { COR_PADRAO, dadosVitrine } from "@/lib/vitrine";
import { Sacola } from "./sacola";

export const metadata: Metadata = { title: "Sacola", robots: { index: false } };

type Params = Promise<{ loja: string }>;

async function ConteudoSacola({ params }: { params: Params }) {
  const { loja: slug } = await params;
  const dados = await dadosVitrine(slug);
  if (!dados) notFound();
  return <Sacola slug={dados.loja.slug} nomeLoja={dados.loja.nome} cor={dados.loja.corDestaque ?? COR_PADRAO} />;
}

export default function PaginaSacola({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-md px-4 pb-32 pt-4">
      <Suspense fallback={null}>
        <ConteudoSacola params={params} />
      </Suspense>
    </main>
  );
}

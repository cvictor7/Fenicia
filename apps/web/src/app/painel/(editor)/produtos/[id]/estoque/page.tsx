import { nomeVariacao } from "@fenicia/core";
import { buscarProdutoCompleto, historicoEstoque, obterBanco } from "@fenicia/db";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";
import { ControleEstoque } from "./controle";

export const metadata: Metadata = { title: "Estoque" };

type Params = Promise<{ id: string }>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROTULO_MOTIVO = { entrada: "Entrada", venda: "Venda", ajuste: "Ajuste", perda: "Perda" } as const;

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Manaus",
});

async function Estoque({ params }: { params: Params }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { loja } = await obterContexto();
  const db = await obterBanco();
  const [produto, historico] = await Promise.all([
    buscarProdutoCompleto(db, loja.id, id),
    historicoEstoque(db, loja.id, id),
  ]);
  if (!produto) notFound();

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href={`/painel/produtos/${id}`} aria-label="Voltar para o produto" className="-ml-2 flex h-10 w-10 items-center justify-center rounded-xl hover:bg-purpura-100">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-titulo text-xl font-semibold tracking-tight">Estoque</h1>
          <p className="truncate text-sm text-tinta-suave">{produto.nome}</p>
        </div>
      </div>

      <div className="mt-5">
        <ControleEstoque
          variacoes={produto.variantes.map((v) => ({ id: v.id, atributos: v.atributos, estoque: v.estoque }))}
          ordem={produto.opcoes.map((o) => o.nome)}
        />
      </div>

      <h2 className="mt-8 font-titulo text-lg font-semibold">Histórico</h2>
      {historico.length === 0 ? (
        <p className="mt-2 text-sm text-tinta-suave">Nenhuma movimentação ainda.</p>
      ) : (
        <ul className="mt-3 divide-y divide-linha rounded-2xl border border-linha bg-white text-sm">
          {historico.slice(0, 50).map((h) => (
            <li key={h.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`w-10 font-medium ${h.quantidade > 0 ? "text-[#0f6e56]" : "text-erro"}`}>
                {h.quantidade > 0 ? `+${h.quantidade}` : h.quantidade}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {ROTULO_MOTIVO[h.motivo]} · {nomeVariacao(h.atributos, produto.opcoes.map((o) => o.nome))}
              </span>
              <time className="shrink-0 text-tinta-suave">{formatoData.format(h.criadoEm)}</time>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function PaginaEstoque({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Carregando />}>
      <Estoque params={params} />
    </Suspense>
  );
}

import { formatarCentavos, inicioDoDia } from "@fenicia/core";
import { listarPedidos, listarProdutosResumo, obterBanco, resumoHoje } from "@fenicia/db";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";
import { CartaoPedido } from "./pedidos/cartao-pedido";

export const metadata: Metadata = { title: "Início" };

/** A frase do topo: o que o lojista precisa saber primeiro. */
function frase(novos: number, vendido: number, produtos: number) {
  if (novos > 0) return novos === 1 ? "1 pedido esperando você" : `${novos} pedidos esperando você`;
  if (vendido > 0) return `Vendeu ${formatarCentavos(vendido)} hoje`;
  if (produtos === 0) return "Vamos montar sua vitrine";
  return "Tudo em dia por aqui";
}

async function Inicio() {
  const { loja } = await obterContexto();
  const db = await obterBanco();
  const [hoje, produtos, pedidos] = await Promise.all([
    resumoHoje(db, loja.id, inicioDoDia(new Date())),
    listarProdutosResumo(db, loja.id),
    listarPedidos(db, loja.id),
  ]);
  const acabando = produtos.filter((p) => p.estoque != null && p.estoque <= 2);
  const novos = pedidos.filter((p) => p.status === "novo").slice(0, 3);

  const numeros = [
    { valor: String(produtos.length), rotulo: produtos.length === 1 ? "produto" : "produtos" },
    { valor: String(acabando.length), rotulo: "acabando", alerta: acabando.length > 0 },
    { valor: formatarCentavos(hoje.vendidoCentavos).replace(",00", ""), rotulo: "vendido hoje" },
  ];

  return (
    <>
      <header className="-mx-4 -mt-6 bg-purpura-700 px-4 pb-7 pt-5 text-sobre-purpura">
        <Link href="/painel/loja" className="inline-flex items-center gap-1.5 text-sm text-sobre-purpura-suave">
          <span aria-hidden="true" className="font-fenicio">𐤀</span> {loja.nome}
        </Link>
        <h1 className="mt-5 font-titulo text-[34px] font-extrabold leading-[1.05] tracking-tight">
          {frase(hoje.novos, hoje.vendidoCentavos, produtos.length)}
        </h1>
        <dl className="mt-6 flex gap-7">
          {numeros.map((n) => (
            <div key={n.rotulo}>
              <dt className="sr-only">{n.rotulo}</dt>
              <dd className={`font-titulo text-2xl font-bold leading-none ${n.alerta ? "text-murex" : ""}`}>{n.valor}</dd>
              <dd aria-hidden="true" className="mt-1 text-xs text-sobre-purpura-suave">{n.rotulo}</dd>
            </div>
          ))}
        </dl>
      </header>

      {novos.length > 0 ? (
        <section className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-titulo text-lg font-bold">Pedidos novos</h2>
            <Link href="/painel/pedidos" className="text-sm font-medium text-purpura-500">Ver todos</Link>
          </div>
          <ul className="space-y-3">
            {novos.map((p) => (
              <li key={p.id}>
                <CartaoPedido pedido={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {acabando.length > 0 ? (
        <section className="mt-7">
          <h2 className="mb-2 font-titulo text-lg font-bold">Acabando</h2>
          <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {acabando.map((p) => (
              <li key={p.id} className="w-28 shrink-0">
                <Link href={`/painel/produtos/${p.id}/estoque`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-purpura-100">
                    {p.capa ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.capa} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span aria-hidden="true" className="flex h-full items-center justify-center font-fenicio text-3xl text-purpura-500">𐤀</span>
                    )}
                    <span className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${p.estoque === 0 ? "bg-erro text-white" : "bg-murex text-purpura-950"}`}>
                      {p.estoque === 0 ? "acabou" : `restam ${p.estoque}`}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-snug">{p.nome}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/painel/novo-post"
        className="mt-7 flex items-center gap-4 rounded-[var(--radius-balao)] border border-linha bg-white p-4"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purpura-700 text-sobre-purpura">
          <Plus size={24} aria-hidden="true" />
        </span>
        <span>
          <span className="block font-titulo text-lg font-bold leading-tight">Postou no Instagram?</span>
          <span className="block text-sm text-tinta-suave">Suba a foto e a legenda que a Fenícia monta o produto.</span>
        </span>
      </Link>
    </>
  );
}

export default function PaginaInicio() {
  return (
    <Suspense fallback={<Carregando />}>
      <Inicio />
    </Suspense>
  );
}

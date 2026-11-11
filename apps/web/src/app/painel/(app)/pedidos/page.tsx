import { ROTULO_STATUS, formatarCentavos, formatarNumeroPedido, nomeVariacao, type StatusPedido } from "@fenicia/core";
import { listarPedidos, obterBanco } from "@fenicia/db";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Vazio } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";
import { AcoesPedido } from "./acoes-pedido";

export const metadata: Metadata = { title: "Pedidos" };

const COR_STATUS: Record<StatusPedido, string> = {
  novo: "bg-purpura-700 text-purpura-100",
  confirmado: "bg-purpura-100 text-purpura-900",
  pago: "bg-[#e3f1ea] text-[#0f6e56]",
  enviado: "bg-[#e3f1ea] text-[#0f6e56]",
  entregue: "bg-linha text-tinta",
  cancelado: "bg-[#f8e4e1] text-erro",
};

const ABAS = [
  { valor: "novos", rotulo: "Novos", status: ["novo"] },
  { valor: "andamento", rotulo: "Em andamento", status: ["confirmado", "pago", "enviado"] },
  { valor: "concluidos", rotulo: "Concluídos", status: ["entregue", "cancelado"] },
] as const;

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Manaus",
});

type Params = Promise<{ aba?: string }>;

async function Lista({ searchParams }: { searchParams: Params }) {
  const { aba: valorAba } = await searchParams;
  const aba = ABAS.find((a) => a.valor === valorAba) ?? ABAS[0];
  const { loja } = await obterContexto();
  const todos = await listarPedidos(await obterBanco(), loja.id);
  const contagem = Object.fromEntries(
    ABAS.map((a) => [a.valor, todos.filter((p) => (a.status as readonly string[]).includes(p.status)).length]),
  );
  const pedidos = todos.filter((p) => (aba.status as readonly string[]).includes(p.status));

  return (
    <>
      <div role="tablist" className="mb-4 grid grid-cols-3 rounded-xl bg-purpura-100 p-1 text-sm">
        {ABAS.map((a) => (
          <Link
            key={a.valor}
            role="tab"
            aria-selected={a.valor === aba.valor}
            href={a.valor === "novos" ? "/painel/pedidos" : `/painel/pedidos?aba=${a.valor}`}
            className="flex h-10 items-center justify-center gap-1 rounded-lg text-purpura-900 aria-selected:bg-white aria-selected:font-medium aria-selected:shadow-sm"
          >
            {a.rotulo}
            {contagem[a.valor] ? <span className="text-xs text-tinta-suave">{contagem[a.valor]}</span> : null}
          </Link>
        ))}
      </div>

      {pedidos.length === 0 ? (
        <Vazio
          letra="𐤂"
          titulo={todos.length === 0 ? "Nenhum pedido ainda" : "Nada por aqui"}
          texto={
            todos.length === 0
              ? "Quando um cliente pedir pela vitrine, o pedido aparece aqui e a mensagem chega no seu WhatsApp."
              : "Os pedidos aparecem nesta aba quando chegarem nessa etapa."
          }
        />
      ) : (
        <ul className="space-y-3">
          {pedidos.map((p) => (
            <li key={p.id} className="rounded-2xl border border-linha bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-titulo text-lg font-semibold">{formatarNumeroPedido(p.numero)}</p>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${COR_STATUS[p.status]}`}>
                  {ROTULO_STATUS[p.status]}
                </span>
              </div>
              <p className="text-sm text-tinta-suave">
                {p.clienteNome ?? "Cliente sem nome"} · {formatoData.format(p.criadoEm)}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {p.itens.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {i.quantidade}x {i.nomeSnapshot}
                      {Object.keys(i.atributosSnapshot).length ? (
                        <span className="text-tinta-suave"> · {nomeVariacao(i.atributosSnapshot)}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0">{formatarCentavos(i.precoUnitCentavos * i.quantidade)}</span>
                  </li>
                ))}
              </ul>
              {p.observacao ? <p className="mt-2 text-sm text-tinta-suave">Obs.: {p.observacao}</p> : null}
              <div className="mt-3 flex justify-between border-t border-linha pt-3 font-medium">
                <span>Total</span>
                <span>{formatarCentavos(p.totalCentavos)}</span>
              </div>
              <AcoesPedido pedidoId={p.id} status={p.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function PaginaPedidos({ searchParams }: { searchParams: Params }) {
  return (
    <>
      <h1 className="mb-4 font-titulo text-2xl font-semibold tracking-tight">Pedidos</h1>
      <Suspense fallback={<Carregando />}>
        <Lista searchParams={searchParams} />
      </Suspense>
    </>
  );
}

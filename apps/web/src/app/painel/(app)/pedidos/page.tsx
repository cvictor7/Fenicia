import { formatarCentavos, formatarNumeroPedido, nomeVariacao } from "@fenicia/core";
import { listarPedidos, obterBanco } from "@fenicia/db";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando, Vazio } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";

export const metadata: Metadata = { title: "Pedidos" };

const STATUS = {
  novo: { rotulo: "Novo", classe: "bg-purpura-700 text-purpura-100" },
  confirmado: { rotulo: "Confirmado", classe: "bg-purpura-100 text-purpura-900" },
  pago: { rotulo: "Pago", classe: "bg-[#e3f1ea] text-[#0f6e56]" },
  enviado: { rotulo: "Enviado", classe: "bg-[#e3f1ea] text-[#0f6e56]" },
  entregue: { rotulo: "Entregue", classe: "bg-linha text-tinta" },
  cancelado: { rotulo: "Cancelado", classe: "bg-[#f8e4e1] text-erro" },
} as const;

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Manaus",
});

async function Lista() {
  const { loja } = await obterContexto();
  const pedidos = await listarPedidos(await obterBanco(), loja.id);

  if (pedidos.length === 0) {
    return (
      <Vazio
        letra="𐤂"
        titulo="Nenhum pedido ainda"
        texto="Quando um cliente pedir pela vitrine, o pedido aparece aqui e a mensagem chega no seu WhatsApp."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {pedidos.map((p) => (
        <li key={p.id} className="rounded-2xl border border-linha bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-titulo text-lg font-semibold">{formatarNumeroPedido(p.numero)}</p>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS[p.status].classe}`}>
              {STATUS[p.status].rotulo}
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
        </li>
      ))}
    </ul>
  );
}

export default function PaginaPedidos() {
  return (
    <>
      <h1 className="font-titulo text-2xl font-semibold tracking-tight">Pedidos</h1>
      <p className="mb-5 mt-1 text-sm text-tinta-suave">
        Em breve: confirmar, mudar o status e baixar o estoque direto daqui.
      </p>
      <Suspense fallback={<Carregando />}>
        <Lista />
      </Suspense>
    </>
  );
}

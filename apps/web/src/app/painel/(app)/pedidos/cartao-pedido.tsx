import { formatarCentavos, formatarNumeroPedido, nomeVariacao, type StatusPedido } from "@fenicia/core";
import { Carimbo } from "@/components/carimbo";
import { AcoesPedido } from "./acoes-pedido";

type Pedido = {
  id: string;
  numero: number;
  status: StatusPedido;
  clienteNome: string | null;
  observacao: string | null;
  totalCentavos: number;
  criadoEm: Date;
  itens: {
    id: string;
    nomeSnapshot: string;
    atributosSnapshot: Record<string, string>;
    quantidade: number;
    precoUnitCentavos: number;
  }[];
};

const formatoHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Manaus",
});

/** Pedido em forma de balão de conversa (ele nasceu de uma mensagem no WhatsApp). */
export function CartaoPedido({ pedido: p }: { pedido: Pedido }) {
  const apagado = p.status === "cancelado" || p.status === "entregue";
  return (
    <article className={`rounded-[var(--radius-balao)] bg-white p-4 ${apagado ? "opacity-75" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-titulo text-xl font-bold leading-tight">
            {formatarNumeroPedido(p.numero)} <span className="font-semibold">{p.clienteNome ?? ""}</span>
          </p>
          <p className="text-sm text-tinta-suave">{formatoHora.format(p.criadoEm)}</p>
        </div>
        <Carimbo status={p.status} />
      </div>

      <ul className="mt-3 space-y-1.5 text-[15px]">
        {p.itens.map((i) => (
          <li key={i.id} className="flex justify-between gap-3">
            <span className={`min-w-0 ${p.status === "cancelado" ? "line-through" : ""}`}>
              {i.quantidade}x {i.nomeSnapshot}
              {Object.keys(i.atributosSnapshot).length ? (
                <span className="text-tinta-suave"> {nomeVariacao(i.atributosSnapshot)}</span>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums">{formatarCentavos(i.precoUnitCentavos * i.quantidade)}</span>
          </li>
        ))}
      </ul>
      {p.observacao ? (
        <p className="mt-2 rounded-lg bg-areia px-3 py-2 text-sm">“{p.observacao}”</p>
      ) : null}
      <p className="mt-3 flex justify-between border-t border-dashed border-linha pt-3">
        <span className="text-tinta-suave">Total</span>
        <span className="font-titulo text-lg font-bold tabular-nums">{formatarCentavos(p.totalCentavos)}</span>
      </p>
      <AcoesPedido pedidoId={p.id} status={p.status} />
    </article>
  );
}

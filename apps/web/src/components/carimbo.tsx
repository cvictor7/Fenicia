import { ROTULO_STATUS, type StatusPedido } from "@fenicia/core";

const COR: Record<StatusPedido, string> = {
  novo: "border-purpura-700 bg-purpura-700 text-sobre-purpura",
  confirmado: "border-purpura-500 text-purpura-500",
  pago: "border-ok text-ok",
  enviado: "border-purpura-700 text-purpura-700",
  entregue: "border-tinta-suave text-tinta-suave",
  cancelado: "border-erro text-erro",
};

/** Carimbo de status, como o carimbo de "PAGO" no caderno de vendas. */
export function Carimbo({ status }: { status: StatusPedido }) {
  return (
    <span
      className={`inline-block -rotate-6 rounded-md border-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${COR[status]}`}
    >
      {ROTULO_STATUS[status]}
    </span>
  );
}

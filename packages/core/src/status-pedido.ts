/**
 * Caminho do pedido: novo → confirmado → pago → enviado → entregue.
 * Dá para cancelar antes de enviar. Entregue e cancelado são finais.
 * Ao confirmar, o estoque é baixado; ao cancelar um pedido já confirmado, ele volta.
 */
export type StatusPedido = "novo" | "confirmado" | "pago" | "enviado" | "entregue" | "cancelado";

const SEGUINTE: Record<StatusPedido, StatusPedido | null> = {
  novo: "confirmado",
  confirmado: "pago",
  pago: "enviado",
  enviado: "entregue",
  entregue: null,
  cancelado: null,
};

const PODE_CANCELAR: StatusPedido[] = ["novo", "confirmado", "pago"];

export function proximoStatus(atual: StatusPedido): StatusPedido | null {
  return SEGUINTE[atual];
}

export function podeCancelar(atual: StatusPedido): boolean {
  return PODE_CANCELAR.includes(atual);
}

export function transicaoPermitida(de: StatusPedido, para: StatusPedido): boolean {
  if (para === "cancelado") return podeCancelar(de);
  return SEGUINTE[de] === para;
}

/** Texto do botão que leva ao próximo passo. */
export const ACAO_STATUS: Record<StatusPedido, string> = {
  novo: "Confirmar e baixar estoque",
  confirmado: "Marcar como pago",
  pago: "Marcar como enviado",
  enviado: "Marcar como entregue",
  entregue: "",
  cancelado: "",
};

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  novo: "Novo",
  confirmado: "Confirmado",
  pago: "Pago",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

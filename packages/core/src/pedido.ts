import { formatarCentavos } from "./dinheiro";

/** 12 → "#0012" */
export function formatarNumeroPedido(numero: number): string {
  return `#${String(numero).padStart(4, "0")}`;
}

export type ItemMensagem = {
  nome: string;
  variacao: string | null;
  quantidade: number;
  precoUnitCentavos: number;
};

/**
 * Mensagem que o cliente manda para a loja no WhatsApp.
 * Curta, com o número do pedido para o lojista achar no painel.
 */
export function montarMensagemPedido(pedido: {
  numero: number;
  itens: ItemMensagem[];
  totalCentavos: number;
  cliente?: string | null;
  observacao?: string | null;
}): string {
  const linhas = [`Olá! Quero fazer o pedido ${formatarNumeroPedido(pedido.numero)}:`, ""];
  for (const item of pedido.itens) {
    const variacao = item.variacao ? ` (${item.variacao})` : "";
    linhas.push(
      `• ${item.quantidade}x ${item.nome}${variacao} · ${formatarCentavos(item.precoUnitCentavos * item.quantidade)}`,
    );
  }
  linhas.push("", `Total: ${formatarCentavos(pedido.totalCentavos)}`);
  if (pedido.cliente?.trim()) linhas.push(`Nome: ${pedido.cliente.trim()}`);
  if (pedido.observacao?.trim()) linhas.push(`Obs.: ${pedido.observacao.trim()}`);
  return linhas.join("\n");
}

/** Link que abre o WhatsApp da loja com a mensagem já escrita. */
export function linkWhatsapp(numero: string, mensagem?: string): string {
  const base = `https://wa.me/${numero.replace(/\D/g, "")}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Soma o total do pedido (sempre com o preço que veio do banco, nunca do navegador). */
export function totalPedido(itens: { quantidade: number; precoUnitCentavos: number }[]): number {
  return itens.reduce((soma, i) => soma + i.quantidade * i.precoUnitCentavos, 0);
}

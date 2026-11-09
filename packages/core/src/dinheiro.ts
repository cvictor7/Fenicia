/**
 * Dinheiro na Fenícia é sempre inteiro em centavos (R$ 89,90 = 8990).
 * Float erra conta de dinheiro (0.1 + 0.2 = 0.30000000000000004); inteiro não.
 */

export function formatarCentavos(centavos: number): string {
  if (!Number.isInteger(centavos)) {
    throw new Error("O valor em centavos precisa ser inteiro");
  }
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(centavos / 100)
    .replace(/\u00a0/g, " ");
}

/**
 * Procura o primeiro preço escrito com "R$" no texto e devolve em centavos.
 * Sem "R$" no texto, devolve null: a Fenícia nunca chuta preço.
 * Aceita "R$ 89,90", "R$89,90", "R$ 1.299,00" e "R$ 50".
 */
export function lerPrecoBR(texto: string): number | null {
  const achado = texto.match(/R\$\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{2}))?/i);
  if (!achado) return null;
  const reais = Number(achado[1].replace(/\./g, ""));
  const centavos = achado[2] ? Number(achado[2]) : 0;
  return reais * 100 + centavos;
}

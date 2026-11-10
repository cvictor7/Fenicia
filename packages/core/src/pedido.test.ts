import { describe, expect, it } from "vitest";
import { formatarNumeroPedido, linkWhatsapp, montarMensagemPedido, totalPedido } from "./pedido";

describe("pedido", () => {
  it("formata o número", () => {
    expect(formatarNumeroPedido(12)).toBe("#0012");
    expect(formatarNumeroPedido(12345)).toBe("#12345");
  });

  it("monta a mensagem do WhatsApp com itens, total e nome", () => {
    const itens = [
      { nome: "Vestido midi", variacao: "M · Preto", quantidade: 2, precoUnitCentavos: 12990 },
      { nome: "Bolsa", variacao: null, quantidade: 1, precoUnitCentavos: 5000 },
    ];
    const msg = montarMensagemPedido({
      numero: 7,
      itens,
      totalCentavos: totalPedido(itens),
      cliente: " Ana ",
      observacao: "",
    });
    expect(msg).toContain("pedido #0007");
    expect(msg).toContain("• 2x Vestido midi (M · Preto) · R$ 259,80");
    expect(msg).toContain("• 1x Bolsa · R$ 50,00");
    expect(msg).toContain("Total: R$ 309,80");
    expect(msg).toContain("Nome: Ana");
    expect(msg).not.toContain("Obs.");
  });

  it("gera o link wa.me com o texto codificado", () => {
    expect(linkWhatsapp("55 92 98416-3597", "Oi & tudo?")).toBe(
      "https://wa.me/5592984163597?text=Oi%20%26%20tudo%3F",
    );
  });
});

import { describe, expect, it } from "vitest";
import { formatarCentavos, lerPrecoBR } from "./dinheiro";

describe("formatarCentavos", () => {
  it("formata centavos em reais", () => {
    expect(formatarCentavos(8990)).toBe("R$ 89,90");
    expect(formatarCentavos(129900)).toBe("R$ 1.299,00");
    expect(formatarCentavos(0)).toBe("R$ 0,00");
  });

  it("recusa valor quebrado", () => {
    expect(() => formatarCentavos(89.9)).toThrow();
  });
});

describe("lerPrecoBR", () => {
  it("lê preços em formatos comuns de legenda", () => {
    expect(lerPrecoBR("Vestido midi R$ 89,90 no Pix")).toBe(8990);
    expect(lerPrecoBR("por apenas R$89,90")).toBe(8990);
    expect(lerPrecoBR("Kit completo R$ 1.299,00")).toBe(129900);
    expect(lerPrecoBR("Bolo de pote R$ 12")).toBe(1200);
  });

  it("devolve null quando não há preço, em vez de inventar", () => {
    expect(lerPrecoBR("Chegou coleção nova! Chama no direct")).toBeNull();
    expect(lerPrecoBR("tamanhos 38 ao 44")).toBeNull();
  });
});

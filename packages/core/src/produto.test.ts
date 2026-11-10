import { describe, expect, it } from "vitest";
import {
  centavosParaCampo,
  chaveAtributos,
  combinarOpcoes,
  converterPrecoDigitado,
  estoqueTotal,
  nomeVariacao,
  podePublicar,
  validarOpcoes,
} from "./produto";

describe("combinarOpcoes", () => {
  it("gera todas as combinações", () => {
    const r = combinarOpcoes([
      { nome: "Tamanho", valores: ["P", "M"] },
      { nome: "Cor", valores: ["Preto", "Areia"] },
    ]);
    expect(r).toHaveLength(4);
    expect(r).toContainEqual({ Tamanho: "M", Cor: "Areia" });
  });
  it("sem opções vira uma variação única", () => {
    expect(combinarOpcoes([])).toEqual([{}]);
    expect(nomeVariacao({})).toBe("Única");
  });
  it("nome da variação segue a ordem das opções, não a do JSON", () => {
    expect(nomeVariacao({ Cor: "Preto", Tamanho: "M" })).toBe("M · Preto");
    expect(nomeVariacao({ Cor: "Preto", Tamanho: "M" }, ["Cor", "Tamanho"])).toBe("Preto · M");
    expect(nomeVariacao({ Voltagem: "220V", Acabamento: "Fosco" })).toBe("220V · Fosco");
  });
  it("ignora opção sem valores", () => {
    expect(combinarOpcoes([{ nome: "Sabor", valores: [] }])).toEqual([{}]);
  });
});

describe("chaveAtributos", () => {
  it("não depende da ordem", () => {
    expect(chaveAtributos({ Cor: "Preto", Tamanho: "M" })).toBe(
      chaveAtributos({ Tamanho: "M", Cor: "Preto" }),
    );
  });
});

describe("validarOpcoes", () => {
  it("aceita opções normais", () => {
    expect(validarOpcoes([{ nome: "Sabor", valores: ["Ninho", "Morango"] }])).toBeNull();
  });
  it("recusa nome vazio, repetido e valor repetido", () => {
    expect(validarOpcoes([{ nome: "", valores: ["P"] }])).not.toBeNull();
    expect(
      validarOpcoes([
        { nome: "Cor", valores: ["Preto"] },
        { nome: "cor", valores: ["Azul"] },
      ]),
    ).not.toBeNull();
    expect(validarOpcoes([{ nome: "Tamanho", valores: ["P", "p"] }])).not.toBeNull();
  });
  it("recusa combinações demais", () => {
    const dez = Array.from({ length: 10 }, (_, i) => String(i));
    expect(
      validarOpcoes([
        { nome: "A", valores: dez },
        { nome: "B", valores: dez },
      ]),
    ).not.toBeNull();
  });
});

describe("converterPrecoDigitado", () => {
  it("entende os jeitos comuns de digitar", () => {
    expect(converterPrecoDigitado("89,90")).toBe(8990);
    expect(converterPrecoDigitado("89")).toBe(8900);
    expect(converterPrecoDigitado("1.299,00")).toBe(129900);
    expect(converterPrecoDigitado("R$ 12,5")).toBe(1250);
    expect(converterPrecoDigitado("")).toBeNull();
  });
  it("marca texto inválido", () => {
    expect(converterPrecoDigitado("abc")).toBeUndefined();
    expect(converterPrecoDigitado("12,345")).toBeUndefined();
  });
  it("volta para o campo do jeito que foi digitado", () => {
    expect(centavosParaCampo(129900)).toBe("1.299,00");
    expect(centavosParaCampo(8990)).toBe("89,90");
    expect(centavosParaCampo(null)).toBe("");
  });
});

describe("podePublicar", () => {
  it("publica com preço", () => {
    expect(podePublicar({ precoCentavos: 8990 }).ok).toBe(true);
  });
  it("não publica sem preço", () => {
    expect(podePublicar({ precoCentavos: null }).ok).toBe(false);
  });
});

describe("estoqueTotal", () => {
  it("soma só o que foi informado", () => {
    expect(estoqueTotal([{ estoque: 2 }, { estoque: null }, { estoque: 3 }])).toBe(5);
    expect(estoqueTotal([{ estoque: null }])).toBeNull();
  });
});

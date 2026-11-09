import { describe, expect, it } from "vitest";
import { conferirSugestao, leituraSimples, precosNaLegenda } from "./ia";

const LEGENDAS = {
  vestido: `Vestido midi de linho 🌿
Perfeito pro calor de Manaus.
Tam: P, M e G
Cores: preto e areia
R$ 129,90 no Pix
#modafeminina #manaus`,
  doce: `Bolo de pote 🍰
Sabores: ninho, morango e brigadeiro
Só R$ 12 cada!`,
  calca: `Calça alfaiataria
Tamanhos 38 ao 44
por 159,90`,
  sem_preco: `Chegou coleção nova!! Chama no direct pra saber o valor 💬`,
  eletronico: `Fone bluetooth com cancelamento de ruído
Bateria de 30h. R$ 1.299,00 ou 10x`,
};

describe("precosNaLegenda", () => {
  it("acha preço com e sem R$", () => {
    expect(precosNaLegenda(LEGENDAS.vestido)[0]).toMatchObject({ centavos: 12990, trecho: "R$ 129,90" });
    expect(precosNaLegenda(LEGENDAS.doce)[0].centavos).toBe(1200);
    expect(precosNaLegenda(LEGENDAS.calca)[0].centavos).toBe(15990);
    expect(precosNaLegenda(LEGENDAS.eletronico)[0].centavos).toBe(129900);
    expect(precosNaLegenda(LEGENDAS.sem_preco)).toEqual([]);
  });
  it("não confunde tamanho com preço", () => {
    expect(precosNaLegenda("Tamanhos 38 ao 44")).toEqual([]);
  });
});

describe("conferirSugestao (regra: nunca inventar preço)", () => {
  it("mantém preço que está na legenda e guarda o trecho", () => {
    const r = conferirSugestao({ nome: "Vestido", precoCentavos: 12990 }, LEGENDAS.vestido);
    expect(r.precoCentavos).toBe(12990);
    expect(r.trechoPreco).toBe("R$ 129,90");
    expect(r.precoDescartado).toBe(false);
  });
  it("descarta preço que a IA inventou", () => {
    const r = conferirSugestao({ nome: "Coleção", precoCentavos: 9990 }, LEGENDAS.sem_preco);
    expect(r.precoCentavos).toBeNull();
    expect(r.precoDescartado).toBe(true);
  });
  it("limpa variações repetidas e vazias", () => {
    const r = conferirSugestao(
      {
        opcoes: [
          { nome: "Tamanho", valores: ["P", "p", " M ", ""] },
          { nome: "tamanho", valores: ["G"] },
          { nome: "Cor", valores: [] },
        ],
      },
      "",
    );
    expect(r.opcoes).toEqual([{ nome: "Tamanho", valores: ["P", "M"] }]);
  });
  it("aguenta resposta torta da IA sem quebrar", () => {
    const r = conferirSugestao({ nome: 123 as unknown as string, opcoes: "x" as unknown as [] }, "");
    expect(r.nome).toBeNull();
    expect(r.opcoes).toEqual([]);
  });
});

describe("leituraSimples", () => {
  it("lê vestido: nome, tamanhos, cores e preço", () => {
    const r = leituraSimples(LEGENDAS.vestido);
    expect(r.nome).toBe("Vestido midi de linho");
    expect(r.precoCentavos).toBe(12990);
    expect(r.opcoes).toContainEqual({ nome: "Tamanho", valores: ["P", "M", "G"] });
    expect(r.opcoes).toContainEqual({ nome: "Cor", valores: ["Preto", "Areia"] });
    expect(r.descricao).toContain("calor de Manaus");
    expect(r.descricao).not.toContain("#");
    expect(r.descricao).toBe("Perfeito pro calor de Manaus.");
  });
  it("lê sabores do doce", () => {
    const r = leituraSimples(LEGENDAS.doce);
    expect(r.opcoes).toContainEqual({ nome: "Sabor", valores: ["Ninho", "Morango", "Brigadeiro"] });
    expect(r.precoCentavos).toBe(1200);
  });
  it("lê faixa de tamanhos numéricos", () => {
    const r = leituraSimples(LEGENDAS.calca);
    expect(r.opcoes).toContainEqual({ nome: "Tamanho", valores: ["38", "40", "42", "44"] });
  });
  it("sem preço na legenda, preço fica vazio", () => {
    expect(leituraSimples(LEGENDAS.sem_preco).precoCentavos).toBeNull();
  });
  it("produto sem variação não ganha variação inventada", () => {
    expect(leituraSimples(LEGENDAS.eletronico).opcoes).toEqual([]);
  });
});

import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import {
  arquivarProduto,
  buscarProdutoCompleto,
  historicoEstoque,
  listarProdutosResumo,
  obterOuCriarCategoria,
  resumoProdutos,
  salvarProduto,
  type DadosProduto,
} from "./produtos";
import * as schema from "./schema";
import { bancoDeTeste } from "./teste-banco";
import type { Banco } from "./tipos";

let db: Banco;
let lojaId: string;
let outraLojaId: string;

beforeEach(async () => {
  db = await bancoDeTeste();
  const [a, b] = await db
    .insert(schema.loja)
    .values([
      { slug: "a", nome: "A" },
      { slug: "b", nome: "B" },
    ])
    .returning();
  lojaId = a.id;
  outraLojaId = b.id;
});

const vestido = (extra: Partial<DadosProduto> = {}): DadosProduto => ({
  nome: "Vestido midi",
  descricao: null,
  categoriaId: null,
  precoCentavos: 12990,
  opcoes: [{ nome: "Tamanho", valores: ["P", "M"] }],
  status: "rascunho",
  variantes: [
    { atributos: { Tamanho: "P" }, precoCentavos: null, estoque: 2 },
    { atributos: { Tamanho: "M" }, precoCentavos: null, estoque: 3 },
  ],
  ...extra,
});

describe("salvarProduto", () => {
  it("cria produto com variações e registra a entrada no estoque", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    const completo = await buscarProdutoCompleto(db, lojaId, p.id);
    expect(completo?.variantes).toHaveLength(2);
    const hist = await historicoEstoque(db, lojaId, p.id);
    expect(hist.map((h) => h.quantidade).sort()).toEqual([2, 3]);
    expect(hist.every((h) => h.motivo === "entrada")).toBe(true);
  });

  it("ajuste de estoque vira linha de ajuste com a diferença", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    await salvarProduto(
      db,
      lojaId,
      "u1",
      vestido({
        variantes: [
          { atributos: { Tamanho: "P" }, precoCentavos: null, estoque: 5 },
          { atributos: { Tamanho: "M" }, precoCentavos: null, estoque: 3 },
        ],
      }),
      p.id,
    );
    const ajustes = (await historicoEstoque(db, lojaId, p.id)).filter((h) => h.motivo === "ajuste");
    expect(ajustes).toHaveLength(1);
    expect(ajustes[0].quantidade).toBe(3);
  });

  it("variação removida fica inativa e some da tela", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    await salvarProduto(
      db,
      lojaId,
      "u1",
      vestido({
        opcoes: [{ nome: "Tamanho", valores: ["M"] }],
        variantes: [{ atributos: { Tamanho: "M" }, precoCentavos: null, estoque: 3 }],
      }),
      p.id,
    );
    expect((await buscarProdutoCompleto(db, lojaId, p.id))?.variantes).toHaveLength(1);
    const todas = await db.select().from(schema.variante).where(eq(schema.variante.produtoId, p.id));
    expect(todas).toHaveLength(2);
  });

  it("não publica sem preço", async () => {
    await expect(
      salvarProduto(db, lojaId, "u1", vestido({ precoCentavos: null, status: "publicado" })),
    ).rejects.toThrow("preço");
  });

  it("gera link único dentro da loja", async () => {
    const a = await salvarProduto(db, lojaId, "u1", vestido());
    const b = await salvarProduto(db, lojaId, "u1", vestido());
    const c = await salvarProduto(db, outraLojaId, "u1", vestido());
    expect([a.slug, b.slug, c.slug]).toEqual(["vestido-midi", "vestido-midi-2", "vestido-midi"]);
  });

  it("não deixa editar produto de outra loja", async () => {
    const p = await salvarProduto(db, outraLojaId, "u1", vestido());
    await expect(salvarProduto(db, lojaId, "u1", vestido({ nome: "Hack" }), p.id)).rejects.toThrow();
    expect((await buscarProdutoCompleto(db, outraLojaId, p.id))?.nome).toBe("Vestido midi");
  });

  it("não aceita categoria de outra loja", async () => {
    const cat = await obterOuCriarCategoria(db, outraLojaId, "Vestidos");
    await expect(salvarProduto(db, lojaId, "u1", vestido({ categoriaId: cat.id }))).rejects.toThrow();
  });
});

describe("listagem", () => {
  it("filtra publicados, rascunhos e sem estoque", async () => {
    await salvarProduto(db, lojaId, "u1", vestido({ status: "publicado" }));
    await salvarProduto(
      db,
      lojaId,
      "u1",
      vestido({
        nome: "Blusa",
        opcoes: [],
        variantes: [{ atributos: {}, precoCentavos: null, estoque: 0 }],
      }),
    );
    expect(await listarProdutosResumo(db, lojaId, "publicados")).toHaveLength(1);
    expect((await listarProdutosResumo(db, lojaId, "sem-estoque")).map((p) => p.nome)).toEqual(["Blusa"]);
    const resumo = await resumoProdutos(db, lojaId);
    expect(resumo).toMatchObject({ total: 2, publicados: 1, rascunhos: 1, semEstoque: 1 });
    expect((await listarProdutosResumo(db, lojaId, "todos", "vest"))[0].estoque).toBe(5);
  });

  it("arquivado sai da lista principal", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    expect(await arquivarProduto(db, outraLojaId, p.id)).toBe(false);
    expect(await arquivarProduto(db, lojaId, p.id)).toBe(true);
    expect(await listarProdutosResumo(db, lojaId)).toHaveLength(0);
    expect(await listarProdutosResumo(db, lojaId, "arquivados")).toHaveLength(1);
  });
});

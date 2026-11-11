import { beforeEach, describe, expect, it } from "vitest";
import { movimentarEstoque } from "./estoque";
import { contarPedidosNovos, criarPedido, listarPedidos, mudarStatusPedido } from "./pedidos";
import { buscarProdutoCompleto, historicoEstoque, salvarProduto, type DadosProduto } from "./produtos";
import * as schema from "./schema";
import { bancoDeTeste } from "./teste-banco";
import type { Banco } from "./tipos";
import { lojaPorSlug, produtoDaVitrine, produtosDaVitrine } from "./vitrine";

let db: Banco;
let lojaId: string;
let outraLojaId: string;

beforeEach(async () => {
  db = await bancoDeTeste();
  const [a, b] = await db
    .insert(schema.loja)
    .values([
      { slug: "mare", nome: "Maré", whatsapp: "5592984163597" },
      { slug: "outra", nome: "Outra" },
    ])
    .returning();
  lojaId = a.id;
  outraLojaId = b.id;
});

const vestido = (extra: Partial<DadosProduto> = {}): DadosProduto => ({
  nome: "Vestido",
  descricao: null,
  categoriaId: null,
  precoCentavos: 10000,
  opcoes: [{ nome: "Tamanho", valores: ["P", "M"] }],
  status: "publicado",
  variantes: [
    { atributos: { Tamanho: "P" }, precoCentavos: null, estoque: 1 },
    { atributos: { Tamanho: "M" }, precoCentavos: 12000, estoque: 0 },
  ],
  ...extra,
});

async function variantes(produtoId: string) {
  const p = await buscarProdutoCompleto(db, lojaId, produtoId);
  const porTamanho = Object.fromEntries(p!.variantes.map((v) => [v.atributos.Tamanho, v]));
  return porTamanho;
}

describe("movimentarEstoque", () => {
  it("soma, tira e grava no histórico", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    const { P } = await variantes(p.id);
    expect((await movimentarEstoque(db, lojaId, "u1", P.id, 3, "entrada")).estoque).toBe(4);
    expect((await movimentarEstoque(db, lojaId, "u1", P.id, -1, "venda")).estoque).toBe(3);
    const hist = await historicoEstoque(db, lojaId, p.id);
    expect(hist.slice(0, 2).map((h) => [h.quantidade, h.motivo])).toEqual([
      [-1, "venda"],
      [3, "entrada"],
    ]);
  });

  it("não deixa ficar negativo e não grava histórico quando recusa", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    const { M } = await variantes(p.id);
    const antes = (await historicoEstoque(db, lojaId, p.id)).length;
    await expect(movimentarEstoque(db, lojaId, "u1", M.id, -1, "venda")).rejects.toThrow("negativo");
    expect((await historicoEstoque(db, lojaId, p.id)).length).toBe(antes);
  });

  it("não mexe em estoque de outra loja", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    const { P } = await variantes(p.id);
    await expect(movimentarEstoque(db, outraLojaId, "u1", P.id, 5, "entrada")).rejects.toThrow("não encontrada");
  });

  it("recusa motivo incoerente", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    const { P } = await variantes(p.id);
    await expect(movimentarEstoque(db, lojaId, "u1", P.id, 2, "venda")).rejects.toThrow();
  });
});

describe("vitrine", () => {
  it("mostra só publicados, com faixa de preço e disponibilidade", async () => {
    await salvarProduto(db, lojaId, "u1", vestido());
    await salvarProduto(db, lojaId, "u1", vestido({ nome: "Rascunho", status: "rascunho" }));
    const lista = await produtosDaVitrine(db, lojaId);
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ nome: "Vestido", precoMin: 10000, precoMax: 12000, disponivel: true });
  });

  it("produto mostra variação esgotada e preço próprio, sem revelar a quantidade", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    const detalhe = await produtoDaVitrine(db, lojaId, p.slug);
    const m = detalhe!.variantes.find((v) => v.atributos.Tamanho === "M")!;
    expect(m).toMatchObject({ disponivel: false, precoCentavos: 12000 });
    expect(detalhe!.variantes.find((v) => v.atributos.Tamanho === "P")!.ultimas).toBe(true);
    expect(JSON.stringify(detalhe)).not.toContain('"estoque"');
  });

  it("não acha produto de outra loja nem loja inexistente", async () => {
    const p = await salvarProduto(db, outraLojaId, "u1", vestido());
    expect(await produtoDaVitrine(db, lojaId, p.slug)).toBeNull();
    expect(await lojaPorSlug(db, "nao-existe")).toBeNull();
  });
});

describe("criarPedido", () => {
  it("usa o preço do banco, numera em sequência e guarda cópia do item", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    const { P } = await variantes(p.id);
    const r1 = await criarPedido(db, lojaId, { itens: [{ varianteId: P.id, quantidade: 1 }], clienteNome: "Ana" });
    expect(r1.pedido).toMatchObject({ numero: 1, totalCentavos: 10000, clienteNome: "Ana", status: "novo" });
    expect(r1.itens[0]).toMatchObject({ nomeSnapshot: "Vestido", precoUnitCentavos: 10000 });
    const r2 = await criarPedido(db, lojaId, { itens: [{ varianteId: P.id, quantidade: 1 }] });
    expect(r2.pedido.numero).toBe(2);
    expect(await contarPedidosNovos(db, lojaId)).toBe(2);
    expect((await listarPedidos(db, lojaId))[0].itens).toHaveLength(1);
  });

  it("recusa variação esgotada ou acima do estoque", async () => {
    const p = await salvarProduto(db, lojaId, "u1", vestido());
    const { P, M } = await variantes(p.id);
    await expect(criarPedido(db, lojaId, { itens: [{ varianteId: M.id, quantidade: 1 }] })).rejects.toThrow("acabou");
    await expect(criarPedido(db, lojaId, { itens: [{ varianteId: P.id, quantidade: 2 }] })).rejects.toThrow("Só tem 1");
  });

  it("recusa produto de outra loja, rascunho e sacola vazia", async () => {
    const deOutra = await salvarProduto(db, outraLojaId, "u1", vestido());
    const v = (await buscarProdutoCompleto(db, outraLojaId, deOutra.id))!.variantes[0];
    await expect(criarPedido(db, lojaId, { itens: [{ varianteId: v.id, quantidade: 1 }] })).rejects.toThrow();
    await expect(criarPedido(db, lojaId, { itens: [] })).rejects.toThrow("vazia");
    const rascunho = await salvarProduto(db, lojaId, "u1", vestido({ nome: "R", status: "rascunho" }));
    const vr = (await buscarProdutoCompleto(db, lojaId, rascunho.id))!.variantes[0];
    await expect(criarPedido(db, lojaId, { itens: [{ varianteId: vr.id, quantidade: 1 }] })).rejects.toThrow();
  });
});

describe("mudarStatusPedido", () => {
  async function pedidoDe(quantidade: number, extra: Partial<DadosProduto> = {}) {
    const p = await salvarProduto(db, lojaId, "u1", vestido(extra));
    const { P } = await variantes(p.id);
    const r = await criarPedido(db, lojaId, { itens: [{ varianteId: P.id, quantidade }] });
    return { produtoId: p.id, varianteId: P.id, pedidoId: r.pedido.id };
  }

  it("confirmar baixa o estoque e registra a venda ligada ao pedido", async () => {
    const { produtoId, pedidoId } = await pedidoDe(1);
    const r = await mudarStatusPedido(db, lojaId, "u1", pedidoId, "confirmado");
    expect(r.status).toBe("confirmado");
    expect((await variantes(produtoId)).P.estoque).toBe(0);
    const venda = (await historicoEstoque(db, lojaId, produtoId)).find((h) => h.motivo === "venda");
    expect(venda?.quantidade).toBe(-1);
    expect(await contarPedidosNovos(db, lojaId)).toBe(0);
  });

  it("não confirma se o estoque acabou depois do pedido (e não muda nada)", async () => {
    const { produtoId, varianteId, pedidoId } = await pedidoDe(1);
    await movimentarEstoque(db, lojaId, "u1", varianteId, -1, "venda");
    await expect(mudarStatusPedido(db, lojaId, "u1", pedidoId, "confirmado")).rejects.toThrow("sem estoque");
    expect((await listarPedidos(db, lojaId))[0].status).toBe("novo");
    expect((await variantes(produtoId)).P.estoque).toBe(0);
  });

  it("confirmar duas vezes não baixa duas vezes", async () => {
    const { produtoId, varianteId, pedidoId } = await pedidoDe(1);
    await movimentarEstoque(db, lojaId, "u1", varianteId, 5, "entrada");
    await mudarStatusPedido(db, lojaId, "u1", pedidoId, "confirmado");
    await expect(mudarStatusPedido(db, lojaId, "u1", pedidoId, "confirmado")).rejects.toThrow();
    expect((await variantes(produtoId)).P.estoque).toBe(5);
  });

  it("cancelar depois de confirmar devolve o estoque", async () => {
    const { produtoId, pedidoId } = await pedidoDe(1);
    await mudarStatusPedido(db, lojaId, "u1", pedidoId, "confirmado");
    await mudarStatusPedido(db, lojaId, "u1", pedidoId, "cancelado");
    expect((await variantes(produtoId)).P.estoque).toBe(1);
  });

  it("cancelar pedido novo não mexe no estoque", async () => {
    const { produtoId, pedidoId } = await pedidoDe(1);
    await mudarStatusPedido(db, lojaId, "u1", pedidoId, "cancelado");
    expect((await variantes(produtoId)).P.estoque).toBe(1);
    expect((await historicoEstoque(db, lojaId, produtoId)).some((h) => h.motivo === "ajuste")).toBe(false);
  });

  it("estoque não informado não é baixado", async () => {
    const { produtoId, pedidoId } = await pedidoDe(3, {
      variantes: [
        { atributos: { Tamanho: "P" }, precoCentavos: null, estoque: null },
        { atributos: { Tamanho: "M" }, precoCentavos: null, estoque: 2 },
      ],
    });
    await mudarStatusPedido(db, lojaId, "u1", pedidoId, "confirmado");
    expect((await variantes(produtoId)).P.estoque).toBeNull();
  });

  it("segue o caminho e não deixa pular nem mexer em pedido de outra loja", async () => {
    const { pedidoId } = await pedidoDe(1);
    await expect(mudarStatusPedido(db, lojaId, "u1", pedidoId, "pago")).rejects.toThrow();
    await expect(mudarStatusPedido(db, outraLojaId, "u1", pedidoId, "confirmado")).rejects.toThrow("não encontrado");
    for (const s of ["confirmado", "pago", "enviado", "entregue"] as const) {
      expect((await mudarStatusPedido(db, lojaId, "u1", pedidoId, s)).status).toBe(s);
    }
    await expect(mudarStatusPedido(db, lojaId, "u1", pedidoId, "cancelado")).rejects.toThrow();
  });
});

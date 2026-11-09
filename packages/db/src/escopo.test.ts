import { beforeEach, describe, expect, it } from "vitest";
import { daLoja } from "./escopo";
import * as schema from "./schema";
import { plantarSemente } from "./semente";
import { bancoDeTeste } from "./teste-banco";
import { criarLojaComDono, lojasDoUsuario, slugDisponivel } from "./usuarios";
import type { Banco } from "./tipos";

/**
 * Cada teste roda num Postgres de verdade, só que embutido (PGlite), criado do zero
 * com as mesmas migrações do Neon. Não precisa de internet nem de senha: roda igual no CI.
 */
let db: Banco;

beforeEach(async () => {
  db = await bancoDeTeste();
});

async function criarLoja(slug: string) {
  const [l] = await db.insert(schema.loja).values({ slug, nome: slug }).returning();
  return l;
}

describe("isolamento entre lojas", () => {
  it("cada loja só lista os próprios produtos", async () => {
    const a = await criarLoja("loja-a");
    const b = await criarLoja("loja-b");
    await daLoja(db, a.id).criarProduto({ nome: "Vestido", slug: "vestido" });
    await daLoja(db, b.id).criarProduto({ nome: "Bolo de pote", slug: "bolo" });

    const deA = await daLoja(db, a.id).listarProdutos();
    expect(deA.map((p) => p.nome)).toEqual(["Vestido"]);
  });

  it("loja A não encontra produto da loja B pelo id", async () => {
    const a = await criarLoja("loja-a");
    const b = await criarLoja("loja-b");
    const daB = await daLoja(db, b.id).criarProduto({ nome: "Bolo", slug: "bolo" });

    expect(await daLoja(db, a.id).buscarProduto(daB.id)).toBeNull();
  });

  it("loja A não consegue alterar produto da loja B", async () => {
    const a = await criarLoja("loja-a");
    const b = await criarLoja("loja-b");
    const daB = await daLoja(db, b.id).criarProduto({ nome: "Bolo", slug: "bolo" });

    const resultado = await daLoja(db, a.id).atualizarProduto(daB.id, { nome: "Hackeado" });
    expect(resultado).toBeNull();
    expect((await daLoja(db, b.id).buscarProduto(daB.id))?.nome).toBe("Bolo");
  });

  it("o mesmo slug pode existir em lojas diferentes, mas não na mesma loja", async () => {
    const a = await criarLoja("loja-a");
    const b = await criarLoja("loja-b");
    await daLoja(db, a.id).criarProduto({ nome: "Camiseta", slug: "camiseta" });
    await daLoja(db, b.id).criarProduto({ nome: "Camiseta", slug: "camiseta" });

    await expect(
      daLoja(db, a.id).criarProduto({ nome: "Outra", slug: "camiseta" }),
    ).rejects.toThrow();
  });
});

describe("regras gravadas no banco", () => {
  it("produto sem preço não pode ser publicado", async () => {
    const a = await criarLoja("loja-a");
    await expect(
      daLoja(db, a.id).criarProduto({ nome: "Sem preço", slug: "x", status: "publicado" }),
    ).rejects.toThrow();
  });

  it("produto sem preço pode ficar em rascunho", async () => {
    const a = await criarLoja("loja-a");
    const p = await daLoja(db, a.id).criarProduto({ nome: "Rascunho", slug: "x" });
    expect(p.precoCentavos).toBeNull();
    expect(p.status).toBe("rascunho");
  });

  it("estoque não fica negativo", async () => {
    const a = await criarLoja("loja-a");
    const p = await daLoja(db, a.id).criarProduto({ nome: "Vestido", slug: "v" });
    await expect(
      db.insert(schema.variante).values({
        lojaId: a.id,
        produtoId: p.id,
        atributos: { Tamanho: "M" },
        estoque: -1,
      }),
    ).rejects.toThrow();
  });

  it("não deixa cadastrar a mesma variação duas vezes", async () => {
    const a = await criarLoja("loja-a");
    const p = await daLoja(db, a.id).criarProduto({ nome: "Vestido", slug: "v" });
    const linha = { lojaId: a.id, produtoId: p.id, atributos: { Tamanho: "M", Cor: "Preto" } };
    await db.insert(schema.variante).values(linha);
    await expect(db.insert(schema.variante).values(linha)).rejects.toThrow();
  });
});

describe("semente", () => {
  it("cria a loja demo uma vez só, mesmo rodando duas vezes", async () => {
    const primeira = await plantarSemente(db);
    const segunda = await plantarSemente(db);
    expect(primeira.criada).toBe(true);
    expect(segunda.criada).toBe(false);
    expect(await daLoja(db, primeira.lojaId).listarCategorias()).toHaveLength(2);
  });
});

describe("usuário e loja", () => {
  async function criarUsuario(id: string) {
    await db.insert(schema.user).values({ id, name: id, email: `${id}@teste.com` });
  }

  it("cria a loja já com o usuário como dono", async () => {
    await criarUsuario("u1");
    const nova = await criarLojaComDono(db, "u1", { slug: "mare", nome: "Maré" });
    const lojas = await lojasDoUsuario(db, "u1");
    expect(lojas).toHaveLength(1);
    expect(lojas[0].loja.id).toBe(nova.id);
    expect(lojas[0].papel).toBe("dono");
  });

  it("usuário não vê loja de outro usuário", async () => {
    await criarUsuario("u1");
    await criarUsuario("u2");
    await criarLojaComDono(db, "u1", { slug: "mare", nome: "Maré" });
    expect(await lojasDoUsuario(db, "u2")).toHaveLength(0);
  });

  it("link repetido falha e não deixa loja sem dono para trás", async () => {
    await criarUsuario("u1");
    await criarUsuario("u2");
    await criarLojaComDono(db, "u1", { slug: "mare", nome: "Maré" });
    expect(await slugDisponivel(db, "mare")).toBe(false);
    await expect(criarLojaComDono(db, "u2", { slug: "mare", nome: "Outra" })).rejects.toThrow();
    expect(await lojasDoUsuario(db, "u2")).toHaveLength(0);
  });
});

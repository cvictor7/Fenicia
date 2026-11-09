import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Regras que valem para todas as tabelas de negócio:
 * - toda tabela tem loja_id: é assim que uma loja nunca enxerga dado de outra (multi-loja);
 * - dinheiro é inteiro em centavos;
 * - datas com fuso (timestamptz), gravadas em UTC.
 */

const criadoEm = () =>
  timestamp("criado_em", { withTimezone: true }).notNull().defaultNow();
const atualizadoEm = () =>
  timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow();

// ---------- Tipos fixos (enums) ----------
export const statusPost = pgEnum("status_post", [
  "processando",
  "revisar",
  "aprovado",
  "descartado",
  "erro",
]);
export const statusProduto = pgEnum("status_produto", [
  "rascunho",
  "publicado",
  "arquivado",
]);
export const motivoMovimento = pgEnum("motivo_movimento", [
  "entrada",
  "venda",
  "ajuste",
  "perda",
]);
export const statusPedido = pgEnum("status_pedido", [
  "novo",
  "confirmado",
  "pago",
  "enviado",
  "entregue",
  "cancelado",
]);
export const origemPedido = pgEnum("origem_pedido", ["vitrine", "manual"]);

/** Opções do produto, ex.: [{ nome: "Tamanho", valores: ["P", "M", "G"] }] */
export type OpcaoProduto = { nome: string; valores: string[] };
/** Combinação de uma variante, ex.: { Tamanho: "M", Cor: "Preto" } */
export type AtributosVariante = Record<string, string>;

// ---------- Loja ----------
export const loja = pgTable("loja", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nome: text("nome").notNull(),
  whatsapp: text("whatsapp"),
  instagram: text("instagram"),
  bio: text("bio"),
  logoUrl: text("logo_url"),
  corDestaque: text("cor_destaque"),
  cidade: text("cidade"),
  criadoEm: criadoEm(),
});

// ---------- Categoria ----------
export const categoria = pgTable(
  "categoria",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lojaId: uuid("loja_id")
      .notNull()
      .references(() => loja.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [uniqueIndex("categoria_loja_slug").on(t.lojaId, t.slug)],
);

// ---------- Post (a origem do produto: foto + legenda) ----------
export const post = pgTable(
  "post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lojaId: uuid("loja_id")
      .notNull()
      .references(() => loja.id, { onDelete: "cascade" }),
    legenda: text("legenda").notNull(),
    status: statusPost("status").notNull().default("processando"),
    respostaIa: jsonb("resposta_ia"),
    modeloIa: text("modelo_ia"),
    erro: text("erro"),
    criadoEm: criadoEm(),
  },
  (t) => [index("post_loja").on(t.lojaId, t.status)],
);

// ---------- Produto ----------
export const produto = pgTable(
  "produto",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lojaId: uuid("loja_id")
      .notNull()
      .references(() => loja.id, { onDelete: "cascade" }),
    postId: uuid("post_id").references(() => post.id, { onDelete: "set null" }),
    categoriaId: uuid("categoria_id").references(() => categoria.id, {
      onDelete: "set null",
    }),
    nome: text("nome").notNull(),
    slug: text("slug").notNull(),
    descricao: text("descricao"),
    // pode ficar vazio: a IA nunca inventa preço
    precoCentavos: integer("preco_centavos"),
    opcoes: jsonb("opcoes").$type<OpcaoProduto[]>().notNull().default([]),
    status: statusProduto("status").notNull().default("rascunho"),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [
    uniqueIndex("produto_loja_slug").on(t.lojaId, t.slug),
    index("produto_loja_status").on(t.lojaId, t.status),
    check("produto_preco_positivo", sql`${t.precoCentavos} >= 0`),
    // sem preço não publica (regra também no código; aqui é a última barreira)
    check(
      "produto_publicado_tem_preco",
      sql`${t.status} <> 'publicado' OR ${t.precoCentavos} IS NOT NULL`,
    ),
  ],
);

// ---------- Imagem do produto ----------
export const imagemProduto = pgTable(
  "imagem_produto",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lojaId: uuid("loja_id")
      .notNull()
      .references(() => loja.id, { onDelete: "cascade" }),
    produtoId: uuid("produto_id")
      .notNull()
      .references(() => produto.id, { onDelete: "cascade" }),
    chave: text("chave").notNull(),
    url: text("url").notNull(),
    ordem: integer("ordem").notNull().default(0),
    largura: integer("largura"),
    altura: integer("altura"),
  },
  (t) => [index("imagem_produto_produto").on(t.produtoId, t.ordem)],
);

// ---------- Variante (cada combinação: M + Preto) ----------
export const variante = pgTable(
  "variante",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lojaId: uuid("loja_id")
      .notNull()
      .references(() => loja.id, { onDelete: "cascade" }),
    produtoId: uuid("produto_id")
      .notNull()
      .references(() => produto.id, { onDelete: "cascade" }),
    atributos: jsonb("atributos").$type<AtributosVariante>().notNull().default({}),
    // sobrescreve o preço do produto quando preenchido
    precoCentavos: integer("preco_centavos"),
    // nulo = estoque não informado (a IA nunca preenche)
    estoque: integer("estoque"),
    ativo: boolean("ativo").notNull().default(true),
  },
  (t) => [
    uniqueIndex("variante_produto_atributos").on(t.produtoId, t.atributos),
    check("variante_estoque_positivo", sql`${t.estoque} >= 0`),
    check("variante_preco_positivo", sql`${t.precoCentavos} >= 0`),
  ],
);

// ---------- Pedido ----------
export const pedido = pgTable(
  "pedido",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lojaId: uuid("loja_id")
      .notNull()
      .references(() => loja.id, { onDelete: "cascade" }),
    numero: integer("numero").notNull(),
    status: statusPedido("status").notNull().default("novo"),
    origem: origemPedido("origem").notNull().default("vitrine"),
    clienteNome: text("cliente_nome"),
    totalCentavos: integer("total_centavos").notNull(),
    observacao: text("observacao"),
    criadoEm: criadoEm(),
  },
  (t) => [
    uniqueIndex("pedido_loja_numero").on(t.lojaId, t.numero),
    index("pedido_loja_status").on(t.lojaId, t.status),
    check("pedido_total_positivo", sql`${t.totalCentavos} >= 0`),
  ],
);

// ---------- Item do pedido (cópia do produto no momento da compra) ----------
export const pedidoItem = pgTable(
  "pedido_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lojaId: uuid("loja_id")
      .notNull()
      .references(() => loja.id, { onDelete: "cascade" }),
    pedidoId: uuid("pedido_id")
      .notNull()
      .references(() => pedido.id, { onDelete: "cascade" }),
    varianteId: uuid("variante_id").references(() => variante.id, {
      onDelete: "set null",
    }),
    nomeSnapshot: text("nome_snapshot").notNull(),
    atributosSnapshot: jsonb("atributos_snapshot")
      .$type<AtributosVariante>()
      .notNull()
      .default({}),
    precoUnitCentavos: integer("preco_unit_centavos").notNull(),
    quantidade: integer("quantidade").notNull(),
  },
  (t) => [
    index("pedido_item_pedido").on(t.pedidoId),
    check("pedido_item_quantidade", sql`${t.quantidade} > 0`),
    check("pedido_item_preco", sql`${t.precoUnitCentavos} >= 0`),
  ],
);

// ---------- Histórico de estoque ----------
export const movimentoEstoque = pgTable(
  "movimento_estoque",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lojaId: uuid("loja_id")
      .notNull()
      .references(() => loja.id, { onDelete: "cascade" }),
    varianteId: uuid("variante_id")
      .notNull()
      .references(() => variante.id, { onDelete: "cascade" }),
    // positivo = entrou, negativo = saiu
    quantidade: integer("quantidade").notNull(),
    motivo: motivoMovimento("motivo").notNull(),
    pedidoId: uuid("pedido_id").references(() => pedido.id, {
      onDelete: "set null",
    }),
    usuarioId: text("usuario_id"),
    criadoEm: criadoEm(),
  },
  (t) => [
    index("movimento_variante").on(t.varianteId, t.criadoEm),
    check("movimento_nao_zero", sql`${t.quantidade} <> 0`),
  ],
);

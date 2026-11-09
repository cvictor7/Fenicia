CREATE TYPE "public"."motivo_movimento" AS ENUM('entrada', 'venda', 'ajuste', 'perda');--> statement-breakpoint
CREATE TYPE "public"."origem_pedido" AS ENUM('vitrine', 'manual');--> statement-breakpoint
CREATE TYPE "public"."status_pedido" AS ENUM('novo', 'confirmado', 'pago', 'enviado', 'entregue', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."status_post" AS ENUM('processando', 'revisar', 'aprovado', 'descartado', 'erro');--> statement-breakpoint
CREATE TYPE "public"."status_produto" AS ENUM('rascunho', 'publicado', 'arquivado');--> statement-breakpoint
CREATE TABLE "categoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "imagem_produto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"chave" text NOT NULL,
	"url" text NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"largura" integer,
	"altura" integer
);
--> statement-breakpoint
CREATE TABLE "loja" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"whatsapp" text,
	"instagram" text,
	"bio" text,
	"logo_url" text,
	"cor_destaque" text,
	"cidade" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loja_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "movimento_estoque" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"variante_id" uuid NOT NULL,
	"quantidade" integer NOT NULL,
	"motivo" "motivo_movimento" NOT NULL,
	"pedido_id" uuid,
	"usuario_id" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movimento_nao_zero" CHECK ("movimento_estoque"."quantidade" <> 0)
);
--> statement-breakpoint
CREATE TABLE "pedido" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"numero" integer NOT NULL,
	"status" "status_pedido" DEFAULT 'novo' NOT NULL,
	"origem" "origem_pedido" DEFAULT 'vitrine' NOT NULL,
	"cliente_nome" text,
	"total_centavos" integer NOT NULL,
	"observacao" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pedido_total_positivo" CHECK ("pedido"."total_centavos" >= 0)
);
--> statement-breakpoint
CREATE TABLE "pedido_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"pedido_id" uuid NOT NULL,
	"variante_id" uuid,
	"nome_snapshot" text NOT NULL,
	"atributos_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"preco_unit_centavos" integer NOT NULL,
	"quantidade" integer NOT NULL,
	CONSTRAINT "pedido_item_quantidade" CHECK ("pedido_item"."quantidade" > 0),
	CONSTRAINT "pedido_item_preco" CHECK ("pedido_item"."preco_unit_centavos" >= 0)
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"legenda" text NOT NULL,
	"status" "status_post" DEFAULT 'processando' NOT NULL,
	"resposta_ia" jsonb,
	"modelo_ia" text,
	"erro" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"post_id" uuid,
	"categoria_id" uuid,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"descricao" text,
	"preco_centavos" integer,
	"opcoes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "status_produto" DEFAULT 'rascunho' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "produto_preco_positivo" CHECK ("produto"."preco_centavos" >= 0),
	CONSTRAINT "produto_publicado_tem_preco" CHECK ("produto"."status" <> 'publicado' OR "produto"."preco_centavos" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "variante" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"atributos" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"preco_centavos" integer,
	"estoque" integer,
	"ativo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "variante_estoque_positivo" CHECK ("variante"."estoque" >= 0),
	CONSTRAINT "variante_preco_positivo" CHECK ("variante"."preco_centavos" >= 0)
);
--> statement-breakpoint
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imagem_produto" ADD CONSTRAINT "imagem_produto_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imagem_produto" ADD CONSTRAINT "imagem_produto_produto_id_produto_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produto"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimento_estoque" ADD CONSTRAINT "movimento_estoque_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimento_estoque" ADD CONSTRAINT "movimento_estoque_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimento_estoque" ADD CONSTRAINT "movimento_estoque_pedido_id_pedido_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedido"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_item" ADD CONSTRAINT "pedido_item_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_item" ADD CONSTRAINT "pedido_item_pedido_id_pedido_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedido"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_item" ADD CONSTRAINT "pedido_item_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto" ADD CONSTRAINT "produto_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto" ADD CONSTRAINT "produto_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto" ADD CONSTRAINT "produto_categoria_id_categoria_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categoria"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variante" ADD CONSTRAINT "variante_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variante" ADD CONSTRAINT "variante_produto_id_produto_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produto"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categoria_loja_slug" ON "categoria" USING btree ("loja_id","slug");--> statement-breakpoint
CREATE INDEX "imagem_produto_produto" ON "imagem_produto" USING btree ("produto_id","ordem");--> statement-breakpoint
CREATE INDEX "movimento_variante" ON "movimento_estoque" USING btree ("variante_id","criado_em");--> statement-breakpoint
CREATE UNIQUE INDEX "pedido_loja_numero" ON "pedido" USING btree ("loja_id","numero");--> statement-breakpoint
CREATE INDEX "pedido_loja_status" ON "pedido" USING btree ("loja_id","status");--> statement-breakpoint
CREATE INDEX "pedido_item_pedido" ON "pedido_item" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX "post_loja" ON "post" USING btree ("loja_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "produto_loja_slug" ON "produto" USING btree ("loja_id","slug");--> statement-breakpoint
CREATE INDEX "produto_loja_status" ON "produto" USING btree ("loja_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "variante_produto_atributos" ON "variante" USING btree ("produto_id","atributos");
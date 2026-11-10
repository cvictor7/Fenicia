# Fenícia

Sistema para o pequeno lojista que vende pelo Instagram e pelo WhatsApp. Você vende do mesmo jeito; a Fenícia organiza catálogo, estoque e pedidos, e um copiloto diz o que fazer.

> Em construção. Fase 1: catálogo automático.

## Rodar localmente

```powershell
pnpm install
pnpm dev
```

Abra http://localhost:3000

Sem internet ou sem o Neon, dá para rodar com um banco local (Postgres embutido, criado sozinho):

```powershell
$env:DATABASE_URL = "pglite:./.banco-local"
pnpm dev
```

## Estrutura

```
apps/web        Next.js (painel, vitrine e API)
packages/core   regras de negócio puras, com testes
packages/db     banco (Drizzle + Neon): tabelas, migrações e acesso por loja
```

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | sobe o app em modo desenvolvimento |
| `pnpm test` | roda os testes |
| `pnpm lint` | confere o padrão do código |
| `pnpm typecheck` | confere os tipos do TypeScript |
| `pnpm build` | aplica as migrações do banco e gera a versão de produção |
| `pnpm db:gerar` | gera a migração SQL depois de mudar o schema |

## Banco de dados

- Postgres no Neon. As migrações rodam sozinhas no deploy da Vercel (`pnpm build`).
- Toda tabela de negócio tem `loja_id`. O acesso passa sempre por `daLoja(db, lojaId)`, e um teste garante que uma loja nunca lê nem altera dado de outra.
- Os testes usam PGlite (Postgres embutido): rodam no CI sem internet e sem senha.
- `GET /api/saude` mostra se o site está conectado ao banco.

## Login

- Better Auth com e-mail e senha (senha guardada com hash, sessão em cookie).
- Cada usuário é ligado à loja pela tabela `membro_loja` (papel `dono` ou `atendente`).
- Fluxo: `/entrar` → criar conta → `/painel/criar-loja` → `/painel`.

## Produtos

- Cadastro com variações (tamanho, cor, sabor...). As combinações são geradas sozinhas, cada uma com estoque e, se quiser, preço próprio.
- Sem preço, o produto fica em rascunho: não publica (regra no código e no banco).
- Toda mudança de estoque vira uma linha no histórico (`movimento_estoque`). Variação removida fica inativa, para não perder o histórico.
- Ações que não dá para desfazer (sair, arquivar) pedem confirmação.

## Novo post (o post vira produto)

1. O lojista sobe as fotos e cola a legenda, do jeito que postaria no Instagram.
2. As fotos são reduzidas no próprio celular (~200 KB) e vão para o Vercel Blob, numa pasta da loja.
3. O Gemini lê fotos + legenda e devolve JSON num formato fixo (nome, categoria, descrição, preço, variações).
4. A resposta passa por `conferirSugestao`: preço que não está escrito na legenda é descartado. Estoque nunca é sugerido.
5. Se o Gemini falhar ou não estiver configurado, entra a leitura simples (regras na legenda), com a mesma conferência.
6. O lojista confere numa tela que mostra de onde veio cada campo e aprova.

## Estoque

- Botões de + e − por variação; o número muda na hora e o servidor confirma (se recusar, volta).
- O `UPDATE` confere "não fica negativo" na mesma instrução: dois celulares tirando a última peça ao mesmo tempo não deixam o estoque em −1.
- Cada toque vira uma linha no histórico (entrada, venda, perda ou ajuste).

## Vitrine pública (link da bio)

- `/<loja>`: grade de produtos com filtro por categoria, botões de WhatsApp e Instagram, na cor da loja.
- `/<loja>/<produto>`: fotos, escolha de variação (esgotada aparece riscada), "últimas unidades" sem revelar a quantidade.
- Páginas em cache (`"use cache"` + `cacheTag`): abrem na hora e não consultam o banco a cada visita. Quando o lojista salva um produto ou mexe no estoque, `updateTag` refaz o cache na hora.

## Pedido pelo WhatsApp

- A sacola fica no navegador do cliente; não precisa de cadastro.
- Ao pedir, o servidor confere tudo no banco (preço, produto publicado, estoque), cria o pedido com número sequencial por loja (`#0001`) e devolve o link do WhatsApp com a mensagem pronta.
- O item guarda uma cópia do nome e do preço: o pedido continua certo mesmo se o produto mudar.
- Campo escondido contra robôs de spam.

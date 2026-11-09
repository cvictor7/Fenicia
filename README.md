# Fenícia

Sistema para o pequeno lojista que vende pelo Instagram e pelo WhatsApp. O post vira produto, a conversa vira venda e um copiloto diz o que fazer.

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

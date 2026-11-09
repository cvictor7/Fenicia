# Fenícia

Sistema para o pequeno lojista que vende pelo Instagram e pelo WhatsApp. O post vira produto, a conversa vira venda e um copiloto diz o que fazer.

> Em construção. Fase 1: catálogo automático.

## Rodar localmente

```powershell
pnpm install
pnpm dev
```

Abra http://localhost:3000

## Estrutura

```
apps/web        Next.js (painel, vitrine e API)
packages/core   regras de negócio puras, com testes
```

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | sobe o app em modo desenvolvimento |
| `pnpm test` | roda os testes |
| `pnpm lint` | confere o padrão do código |
| `pnpm typecheck` | confere os tipos do TypeScript |
| `pnpm build` | gera a versão de produção |

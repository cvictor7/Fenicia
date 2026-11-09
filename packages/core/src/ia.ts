import type { Opcao } from "./produto";

/**
 * Regras do "post vira produto".
 * A IA (ou a leitura simples) sugere; estas funções conferem a sugestão contra a legenda
 * antes de qualquer coisa chegar na tela. Preço que não está escrito na legenda é descartado.
 * Estoque nunca é sugerido: só o lojista sabe quanto tem.
 */

export type SugestaoProduto = {
  nome: string | null;
  categoria: string | null;
  descricao: string | null;
  precoCentavos: number | null;
  opcoes: Opcao[];
};

export type SugestaoConferida = SugestaoProduto & {
  /** trecho da legenda onde o preço foi achado, para mostrar "de onde veio" */
  trechoPreco: string | null;
  /** a IA sugeriu um preço que não está na legenda (e foi descartado) */
  precoDescartado: boolean;
};

const PRECO = /(?:R\$\s*)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?|\b(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})\b/gi;

/** Todos os preços escritos na legenda ("R$ 89,90", "R$89", "89,90"), com o trecho exato. */
export function precosNaLegenda(legenda: string): { centavos: number; trecho: string }[] {
  const achados: { centavos: number; trecho: string }[] = [];
  for (const m of legenda.matchAll(PRECO)) {
    const reais = (m[1] ?? m[3]).replace(/\./g, "");
    const cent = (m[2] ?? m[4] ?? "").padEnd(2, "0");
    achados.push({ centavos: Number(reais) * 100 + Number(cent || "0"), trecho: m[0].trim() });
  }
  return achados;
}

function limparTexto(texto: unknown, max: number): string | null {
  if (typeof texto !== "string") return null;
  const limpo = texto.replace(/\s+/g, " ").trim().slice(0, max).trim();
  return limpo || null;
}

/** Confere a sugestão: limpa textos, organiza variações e só mantém preço que existe na legenda. */
export function conferirSugestao(bruta: Partial<SugestaoProduto>, legenda: string): SugestaoConferida {
  const precos = precosNaLegenda(legenda);
  const precoSugerido = typeof bruta.precoCentavos === "number" ? Math.round(bruta.precoCentavos) : null;
  const confirmado = precoSugerido != null ? precos.find((p) => p.centavos === precoSugerido) : undefined;

  const opcoes: Opcao[] = [];
  for (const o of Array.isArray(bruta.opcoes) ? bruta.opcoes : []) {
    const nome = limparTexto(o?.nome, 30);
    if (!nome || opcoes.some((x) => x.nome.toLowerCase() === nome.toLowerCase())) continue;
    const valores: string[] = [];
    for (const v of Array.isArray(o?.valores) ? o.valores : []) {
      const valor = limparTexto(v, 30);
      if (valor && !valores.some((x) => x.toLowerCase() === valor.toLowerCase())) valores.push(valor);
    }
    if (valores.length) opcoes.push({ nome, valores: valores.slice(0, 15) });
    if (opcoes.length === 3) break;
  }

  return {
    nome: limparTexto(bruta.nome, 120),
    categoria: limparTexto(bruta.categoria, 40),
    descricao: limparTexto(bruta.descricao, 1000),
    precoCentavos: confirmado ? confirmado.centavos : null,
    opcoes,
    trechoPreco: confirmado?.trecho ?? null,
    precoDescartado: precoSugerido != null && !confirmado,
  };
}

// ---------------- Leitura simples (sem IA) ----------------

const CORES = [
  "preto", "preta", "branco", "branca", "off white", "off-white", "azul", "azul marinho", "vermelho",
  "vermelha", "verde", "rosa", "bege", "nude", "areia", "marrom", "cinza", "amarelo", "amarela",
  "lilás", "lilas", "roxo", "roxa", "vinho", "caramelo", "laranja", "dourado", "dourada", "prata",
  "terracota", "goiaba", "chocolate",
];
const TAMANHOS_LETRA = ["PP", "P", "M", "G", "GG", "XG", "XGG", "EG", "EGG", "U"];

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function separarLista(trecho: string): string[] {
  return trecho
    .split(/,|\/|\be\b|\||;|·/i)
    .map((v) => v.replace(/[.!*#]/g, "").trim())
    .filter((v) => v && v.length <= 30);
}

/**
 * Leitura sem IA: acha preço, tamanhos, cores e sabores escritos na legenda.
 * É o plano B quando a IA não responde, e mostra que a regra "nunca inventar" vale para os dois.
 */
export function leituraSimples(legenda: string): SugestaoProduto {
  const linhas = legenda
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const primeira = (linhas[0] ?? "")
    .replace(/[#@]\S+/g, "")
    .replace(/[\p{Extended_Pictographic}️]/gu, "")
    .replace(/R\$\s*[\d.,]+/gi, "")
    .replace(/[|•–-]\s*$/g, "")
    .trim();

  const opcoes: Opcao[] = [];
  const minusculo = legenda.toLowerCase();

  // tamanhos: "Tam: P, M e G" · "Tamanhos 38 ao 44" · "P M G GG"
  const linhaTam = linhas.find((l) => /\btam(anhos?)?\b|\btamanho/i.test(l));
  if (linhaTam) {
    const depois = linhaTam.replace(/^.*?\btam(?:anhos?|\.)?\s*:?\s*/i, "");
    const faixa = depois.match(/(\d{2})\s*(?:ao|a|até|-)\s*(\d{2})/i);
    if (faixa) {
      const [ini, fim] = [Number(faixa[1]), Number(faixa[2])];
      if (fim > ini && fim - ini <= 16) {
        const valores = [];
        for (let n = ini; n <= fim; n += 2) valores.push(String(n));
        opcoes.push({ nome: "Tamanho", valores });
      }
    } else {
      const valores = separarLista(depois.toUpperCase().replace(/\s+/g, ","))
        .filter((v) => TAMANHOS_LETRA.includes(v) || /^\d{2}$/.test(v));
      if (valores.length) opcoes.push({ nome: "Tamanho", valores: [...new Set(valores)] });
    }
  }

  // cores: palavras de cor conhecidas
  const cores = CORES.filter((c) => new RegExp(`(^|[^\\p{L}])${c}([^\\p{L}]|$)`, "iu").test(minusculo))
    .filter((c, _, todas) => !todas.some((outra) => outra !== c && outra.includes(c)));
  const masculino: Record<string, string> = {
    preta: "preto", branca: "branco", vermelha: "vermelho", amarela: "amarelo",
    roxa: "roxo", dourada: "dourado", "off-white": "off white", lilas: "lilás",
  };
  const coresUnicas = [...new Set(cores.map((c) => masculino[c] ?? c))];
  if (coresUnicas.length >= 2 || /\bcor(es)?\b/i.test(legenda)) {
    if (coresUnicas.length) opcoes.push({ nome: "Cor", valores: coresUnicas.map(capitalizar) });
  }

  // sabores: "Sabores: ninho, morango e brigadeiro"
  const linhaSabor = linhas.find((l) => /\bsabor(es)?\s*:/i.test(l));
  if (linhaSabor) {
    const valores = separarLista(linhaSabor.replace(/^.*?\bsabor(es)?\s*:\s*/i, "")).map(capitalizar);
    if (valores.length) opcoes.push({ nome: "Sabor", valores });
  }

  const descricao = linhas
    .slice(1)
    .filter((l) => !/^[#@]/.test(l) && !/R\$/.test(l))
    // linhas de tamanho, cor e sabor já viraram variações
    .filter((l) => !/^\s*(tam(anhos?)?|cor(es)?|sabor(es)?)\b/i.test(l))
    .join(" ")
    .replace(/#\S+/g, "")
    .trim();

  return {
    nome: primeira || null,
    categoria: null,
    descricao: descricao || null,
    precoCentavos: precosNaLegenda(legenda)[0]?.centavos ?? null,
    opcoes,
  };
}

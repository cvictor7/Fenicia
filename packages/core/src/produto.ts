/**
 * Regras do produto: variações, preço digitado e quando pode publicar.
 * Funções puras, usadas tanto na tela (para mostrar o erro na hora) quanto no servidor (que decide de verdade).
 */

export type Opcao = { nome: string; valores: string[] };
export type Atributos = Record<string, string>;

export const LIMITE_OPCOES = 3;
export const LIMITE_VARIACOES = 60;

/**
 * Gera todas as combinações das opções.
 * [{Tamanho: P,M}, {Cor: Preto,Areia}] → P·Preto, P·Areia, M·Preto, M·Areia.
 * Sem opções → uma variação "única" ({}), para o produto ter onde guardar estoque.
 */
export function combinarOpcoes(opcoes: Opcao[]): Atributos[] {
  const validas = opcoes.filter((o) => o.nome.trim() && o.valores.length > 0);
  return validas.reduce<Atributos[]>(
    (combinacoes, opcao) =>
      combinacoes.flatMap((atual) =>
        opcao.valores.map((valor) => ({ ...atual, [opcao.nome.trim()]: valor })),
      ),
    [{}],
  );
}

/** Chave estável para comparar variações, independente da ordem dos campos. */
export function chaveAtributos(atributos: Atributos): string {
  return Object.keys(atributos)
    .sort()
    .map((k) => `${k}=${atributos[k]}`)
    .join("|");
}

const PRIORIDADE = ["tamanho", "cor", "sabor", "modelo", "voltagem"];

/**
 * "M · Preto" (ou "Única" quando o produto não tem variações).
 * O Postgres guarda o JSON com as chaves reordenadas, então a ordem vem das opções do produto
 * quando informadas; senão segue Tamanho, Cor, Sabor... e o resto em ordem alfabética.
 */
export function nomeVariacao(atributos: Atributos, ordem?: string[]): string {
  const peso = (chave: string) => {
    const naOrdem = ordem?.indexOf(chave) ?? -1;
    if (naOrdem >= 0) return naOrdem;
    const prioridade = PRIORIDADE.indexOf(chave.toLowerCase());
    return 100 + (prioridade >= 0 ? prioridade : PRIORIDADE.length);
  };
  const chaves = Object.keys(atributos).sort((a, b) => peso(a) - peso(b) || a.localeCompare(b));
  return chaves.length ? chaves.map((k) => atributos[k]).join(" · ") : "Única";
}

export function validarOpcoes(opcoes: Opcao[]): string | null {
  if (opcoes.length > LIMITE_OPCOES) return `Use no máximo ${LIMITE_OPCOES} tipos de variação.`;
  const nomes = new Set<string>();
  for (const opcao of opcoes) {
    const nome = opcao.nome.trim().toLowerCase();
    if (!nome) return "Dê um nome para cada variação (ex.: Tamanho).";
    if (nomes.has(nome)) return `A variação "${opcao.nome}" está repetida.`;
    nomes.add(nome);
    if (opcao.valores.length === 0) return `Coloque pelo menos uma opção em "${opcao.nome}".`;
    const valores = new Set(opcao.valores.map((v) => v.trim().toLowerCase()));
    if (valores.size !== opcao.valores.length) return `Tem opção repetida em "${opcao.nome}".`;
  }
  if (combinarOpcoes(opcoes).length > LIMITE_VARIACOES) {
    return `São combinações demais (máximo ${LIMITE_VARIACOES}). Tire algumas opções.`;
  }
  return null;
}

/**
 * Converte o que o lojista digitou em centavos.
 * "89,90" → 8990 · "89" → 8900 · "1.299,00" → 129900 · "R$ 12,5" → 1250 · "" → null.
 * Devolve undefined quando o texto não é um preço (para mostrar erro).
 */
export function converterPrecoDigitado(texto: string): number | null | undefined {
  const limpo = texto.replace(/R\$/i, "").replace(/\s/g, "");
  if (!limpo) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(limpo)) return undefined;
  const [reais, centavos = ""] = limpo.replace(/\./g, "").split(",");
  return Number(reais) * 100 + Number(centavos.padEnd(2, "0"));
}

/** 8990 → "89,90" (para preencher o campo de preço ao editar). */
export function centavosParaCampo(centavos: number | null | undefined): string {
  if (centavos == null) return "";
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, "0");
  return `${reais.toLocaleString("pt-BR")},${resto}`;
}

/**
 * Só publica com o preço base preenchido (cada variação pode ter um preço diferente por cima dele).
 * O banco tem a mesma regra: é a última barreira se o código falhar.
 */
export function podePublicar(produto: { precoCentavos: number | null }):
  | { ok: true }
  | { ok: false; motivo: string } {
  if (produto.precoCentavos != null) return { ok: true };
  return { ok: false, motivo: "Coloque o preço antes de publicar." };
}

/** Soma do estoque. Null quando nenhuma variação tem estoque informado. */
export function estoqueTotal(variantes: { estoque: number | null; ativo?: boolean }[]): number | null {
  const informados = variantes.filter((v) => v.ativo !== false && v.estoque != null);
  if (informados.length === 0) return null;
  return informados.reduce((soma, v) => soma + (v.estoque ?? 0), 0);
}

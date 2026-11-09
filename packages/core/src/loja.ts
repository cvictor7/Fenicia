/**
 * Regras dos dados da loja: link (slug), WhatsApp e Instagram.
 * Funções puras: não acessam banco nem rede, por isso são fáceis de testar.
 */

/** Endereços do próprio sistema que uma loja não pode usar como link. */
export const SLUGS_RESERVADOS = new Set([
  "api", "app", "painel", "entrar", "sair", "cadastro", "conta", "admin",
  "demo", "loja", "lojas", "fenicia", "ajuda", "suporte", "termos",
  "privacidade", "precos", "blog", "static", "_next", "favicon.ico",
]);

/** "Maré Ateliê & Cia" → "mare-atelie-cia" */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export type ResultadoValidacao = { ok: true } | { ok: false; motivo: string };

export function validarSlug(slug: string): ResultadoValidacao {
  if (slug.length < 3) return { ok: false, motivo: "Use pelo menos 3 letras." };
  if (slug.length > 40) return { ok: false, motivo: "Use no máximo 40 caracteres." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, motivo: "Use só letras minúsculas, números e hífen." };
  }
  if (SLUGS_RESERVADOS.has(slug)) return { ok: false, motivo: "Esse link é reservado. Tente outro." };
  return { ok: true };
}

/**
 * Deixa o WhatsApp no formato do link wa.me: 55 + DDD + número.
 * "(92) 98416-3597" → "5592984163597". Devolve null se não parecer um celular/fixo do Brasil.
 */
export function normalizarWhatsapp(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, "");
  // com "+" na frente, o número já traz o país: só aceita +55
  if (entrada.trim().startsWith("+") && !digitos.startsWith("55")) return null;
  if (digitos.startsWith("0")) digitos = digitos.replace(/^0+/, "");
  if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`;
  if (!digitos.startsWith("55")) return null;
  if (digitos.length !== 12 && digitos.length !== 13) return null;
  return digitos;
}

/** "@mare.atelie", "instagram.com/mare.atelie/" → "mare.atelie". Null se inválido. */
export function normalizarInstagram(entrada: string): string | null {
  const limpo = entrada
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(limpo)) return null;
  return limpo;
}

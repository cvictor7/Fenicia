import { describe, expect, it } from "vitest";
import { gerarSlug, normalizarInstagram, normalizarWhatsapp, validarSlug } from "./loja";

describe("gerarSlug", () => {
  it("tira acento, espaço e símbolo", () => {
    expect(gerarSlug("Maré Ateliê & Cia")).toBe("mare-atelie-cia");
    expect(gerarSlug("  Doces da Vó!! ")).toBe("doces-da-vo");
  });
  it("corta em 40 caracteres sem terminar em hífen", () => {
    const slug = gerarSlug("a".repeat(39) + " bbbb");
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("validarSlug", () => {
  it("aceita link normal", () => {
    expect(validarSlug("mare-atelie")).toEqual({ ok: true });
  });
  it("recusa curto, com símbolo ou reservado", () => {
    expect(validarSlug("ab").ok).toBe(false);
    expect(validarSlug("Maré").ok).toBe(false);
    expect(validarSlug("loja--x").ok).toBe(false);
    expect(validarSlug("painel").ok).toBe(false);
  });
});

describe("normalizarWhatsapp", () => {
  it("aceita os jeitos comuns de escrever", () => {
    expect(normalizarWhatsapp("(92) 98416-3597")).toBe("5592984163597");
    expect(normalizarWhatsapp("+55 92 98416-3597")).toBe("5592984163597");
    expect(normalizarWhatsapp("092984163597")).toBe("5592984163597");
    expect(normalizarWhatsapp("(92) 3236-2487")).toBe("559232362487");
  });
  it("recusa número que não é do Brasil ou incompleto", () => {
    expect(normalizarWhatsapp("98416-3597")).toBeNull();
    expect(normalizarWhatsapp("+1 415 555 0172")).toBeNull();
  });
});

describe("normalizarInstagram", () => {
  it("aceita @, link ou nome puro", () => {
    expect(normalizarInstagram("@Mare.Atelie")).toBe("mare.atelie");
    expect(normalizarInstagram("https://www.instagram.com/mare.atelie/")).toBe("mare.atelie");
    expect(normalizarInstagram("mare_atelie")).toBe("mare_atelie");
  });
  it("recusa texto com espaço ou símbolo", () => {
    expect(normalizarInstagram("mare atelie")).toBeNull();
    expect(normalizarInstagram("")).toBeNull();
  });
});

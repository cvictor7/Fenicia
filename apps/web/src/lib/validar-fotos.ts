import { z } from "zod";

/** Formato das fotos que o navegador manda de volta junto com o formulário. */
export const esquemaFotos = z
  .array(
    z.object({
      url: z.string().max(5_000_000),
      chave: z.string().max(200),
      largura: z.number().int().positive().nullable(),
      altura: z.number().int().positive().nullable(),
    }),
  )
  .max(6, "No máximo 6 fotos.");

/**
 * Confere que as fotos foram enviadas por esta loja (pasta lojas/<id>/) e moram no Blob.
 * Impede que alguém cole no formulário uma foto de outra loja ou um link qualquer.
 */
export function fotosDaLoja(fotos: z.infer<typeof esquemaFotos>, lojaId: string) {
  return fotos.every((f) => {
    if (!f.chave.startsWith(`lojas/${lojaId}/`)) return false;
    if (f.url.startsWith("data:image/")) return Boolean(process.env.DATABASE_URL?.startsWith("pglite:"));
    try {
      const url = new URL(f.url);
      return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
    } catch {
      return false;
    }
  });
}

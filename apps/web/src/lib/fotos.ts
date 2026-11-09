import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

export type FotoGuardada = { url: string; chave: string };

const TIPOS = new Map([
  ["image/webp", "webp"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);
export const TAMANHO_MAXIMO = 3 * 1024 * 1024;

/**
 * Guarda a foto no Vercel Blob, numa pasta só da loja.
 * No PC (modo local, banco embutido), sem a chave do Blob, devolve a foto embutida (data URL).
 */
export async function guardarFoto(arquivo: File, lojaId: string): Promise<FotoGuardada> {
  const extensao = TIPOS.get(arquivo.type);
  if (!extensao) throw new Error("Envie foto em JPG, PNG ou WEBP.");
  if (arquivo.size > TAMANHO_MAXIMO) throw new Error("Foto grande demais (máximo 3 MB).");

  const chave = `lojas/${lojaId}/${randomUUID()}.${extensao}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const resultado = await put(chave, arquivo, {
      access: "public",
      contentType: arquivo.type,
      addRandomSuffix: false,
    });
    return { url: resultado.url, chave };
  }

  // modo local (banco embutido no PC): sem Blob, a foto vai embutida
  if (process.env.DATABASE_URL?.startsWith("pglite:")) {
    const base64 = Buffer.from(await arquivo.arrayBuffer()).toString("base64");
    return { url: `data:${arquivo.type};base64,${base64}`, chave };
  }

  throw new Error("Armazenamento de fotos não configurado.");
}

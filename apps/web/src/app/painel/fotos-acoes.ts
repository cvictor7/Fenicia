"use server";

import { guardarFoto } from "@/lib/fotos";
import { obterContexto } from "@/lib/contexto";

export type RespostaFoto =
  | { ok: true; url: string; chave: string; largura: number | null; altura: number | null }
  | { ok: false; erro: string };

/** Recebe uma foto (já reduzida no celular) e guarda na pasta da loja. */
export async function enviarFotoAcao(form: FormData): Promise<RespostaFoto> {
  const { loja } = await obterContexto();
  const arquivo = form.get("foto");
  if (!(arquivo instanceof File)) return { ok: false, erro: "Nenhuma foto recebida." };

  const largura = Number(form.get("largura")) || null;
  const altura = Number(form.get("altura")) || null;
  try {
    const foto = await guardarFoto(arquivo, loja.id);
    return { ok: true, ...foto, largura, altura };
  } catch (erro) {
    return { ok: false, erro: erro instanceof Error ? erro.message : "Não deu para enviar a foto." };
  }
}

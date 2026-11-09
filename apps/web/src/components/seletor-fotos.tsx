"use client";

import { ImagePlus, Star, X } from "lucide-react";
import { useRef, useState } from "react";
import { enviarFotoAcao } from "@/app/painel/fotos-acoes";

export type Foto = { url: string; chave: string; largura: number | null; altura: number | null };

const LADO_MAXIMO = 1600;

/**
 * Reduz a foto no próprio celular antes de enviar: uma foto de 4 MB vira ~200 KB.
 * Envio mais rápido no 4G, menos espaço gasto e vitrine mais leve.
 */
async function reduzirFoto(arquivo: File): Promise<{ blob: Blob; largura: number; altura: number }> {
  const imagem = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height));
  const largura = Math.round(imagem.width * escala);
  const altura = Math.round(imagem.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  canvas.getContext("2d")!.drawImage(imagem, 0, 0, largura, altura);
  imagem.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", 0.82));
  if (blob && blob.type === "image/webp") return { blob, largura, altura };
  // navegadores antigos não geram webp: cai para jpeg
  const jpeg = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
  if (!jpeg) throw new Error("Não deu para ler essa foto.");
  return { blob: jpeg, largura, altura };
}

type Props = {
  fotos: Foto[];
  aoMudar: (fotos: Foto[]) => void;
  maximo?: number;
};

export function SeletorFotos({ fotos, aoMudar, maximo = 6 }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  async function escolher(lista: FileList | null) {
    if (!lista?.length) return;
    setErro(null);
    const arquivos = Array.from(lista).slice(0, maximo - fotos.length);
    setEnviando(arquivos.length);
    let atuais = fotos;
    for (const arquivo of arquivos) {
      try {
        const { blob, largura, altura } = await reduzirFoto(arquivo);
        const form = new FormData();
        form.append("foto", new File([blob], "foto", { type: blob.type }));
        form.append("largura", String(largura));
        form.append("altura", String(altura));
        const resposta = await enviarFotoAcao(form);
        if (!resposta.ok) throw new Error(resposta.erro);
        const { url, chave } = resposta;
        atuais = [...atuais, { url, chave, largura, altura }];
        aoMudar(atuais);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não deu para enviar a foto.");
      } finally {
        setEnviando((n) => n - 1);
      }
    }
    if (entrada.current) entrada.current.value = "";
  }

  function tornarCapa(i: number) {
    aoMudar([fotos[i], ...fotos.filter((_, j) => j !== i)]);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((foto, i) => (
          <div key={foto.chave} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-linha/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded-md bg-purpura-900/80 px-1.5 py-0.5 text-[11px] text-purpura-100">Capa</span>
            ) : (
              <button
                type="button"
                onClick={() => tornarCapa(i)}
                aria-label={`Usar foto ${i + 1} como capa`}
                className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-purpura-700"
              >
                <Star size={14} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={() => aoMudar(fotos.filter((_, j) => j !== i))}
              aria-label={`Tirar foto ${i + 1}`}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-tinta"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        {Array.from({ length: enviando }, (_, i) => (
          <div key={`enviando-${i}`} className="flex aspect-[4/5] animate-pulse items-center justify-center rounded-xl bg-purpura-100 text-xs text-purpura-700">
            Enviando…
          </div>
        ))}
        {fotos.length + enviando < maximo ? (
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-purpura-500 text-sm text-purpura-700"
          >
            <ImagePlus size={22} aria-hidden="true" />
            {fotos.length ? "Mais fotos" : "Fotos"}
          </button>
        ) : null}
      </div>
      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        hidden
        aria-label="Escolher fotos"
        onChange={(e) => escolher(e.target.files)}
      />
      {erro ? <p role="alert" className="mt-2 text-sm text-erro">{erro}</p> : null}
    </div>
  );
}

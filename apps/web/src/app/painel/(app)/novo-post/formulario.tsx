"use client";

import { Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import { SeletorFotos, type Foto } from "@/components/seletor-fotos";
import { lerPostAcao, type EstadoPost } from "./acoes";

export function FormularioPost() {
  const [estado, acao, lendo] = useActionState(lerPostAcao, {} as EstadoPost);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [legenda, setLegenda] = useState("");

  return (
    <form action={acao} className="space-y-5">
      <input type="hidden" name="dados" value={JSON.stringify({ legenda, fotos })} />
      {estado.erro ? (
        <p role="alert" className="rounded-xl bg-[#f8e4e1] px-3.5 py-3 text-sm text-erro">{estado.erro}</p>
      ) : null}

      <section>
        <h2 className="mb-2 text-sm font-medium">Fotos do post</h2>
        <SeletorFotos fotos={fotos} aoMudar={setFotos} />
      </section>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Legenda</span>
        <textarea
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder={"Cole a legenda do jeito que vai no Instagram.\nEx.: Vestido midi de linho 🌿 Tam: P, M e G. Cores: preto e areia. R$ 129,90"}
          className="block min-h-40 w-full rounded-xl border border-linha bg-white px-3.5 py-3 text-base outline-none focus:border-purpura-700 focus:ring-2 focus:ring-purpura-100"
        />
        <span className="mt-1.5 block text-sm text-tinta-suave">
          Preço só entra se estiver escrito na legenda. Estoque você preenche depois.
        </span>
      </label>

      <button
        type="submit"
        disabled={lendo}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purpura-700 font-medium text-purpura-100 disabled:opacity-70"
      >
        <Sparkles size={18} aria-hidden="true" />
        {lendo ? "Lendo o post…" : "Ler post"}
      </button>
    </form>
  );
}

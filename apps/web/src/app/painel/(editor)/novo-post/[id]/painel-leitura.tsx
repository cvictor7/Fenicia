import { formatarCentavos, type SugestaoConferida } from "@fenicia/core";
import { CircleAlert, CircleCheck, Sparkles } from "lucide-react";

/** Mostra o que foi lido do post e de onde veio cada coisa, para o lojista conferir rápido. */
export function PainelLeitura({
  legenda,
  sugestao,
  modelo,
}: {
  legenda: string;
  sugestao: SugestaoConferida;
  modelo: string;
}) {
  const itens: { ok: boolean; rotulo: string; texto: string }[] = [
    {
      ok: Boolean(sugestao.nome),
      rotulo: "Nome",
      texto: sugestao.nome ?? "Não deu para identificar. Preencha.",
    },
    sugestao.precoCentavos != null
      ? { ok: true, rotulo: "Preço", texto: `${formatarCentavos(sugestao.precoCentavos)} · achado na legenda` }
      : {
          ok: false,
          rotulo: "Preço",
          texto: sugestao.precoDescartado
            ? "A IA sugeriu um preço que não está na legenda. Deixamos vazio: preencha."
            : "Não tem preço na legenda. Preencha.",
        },
    {
      ok: true,
      rotulo: "Variações",
      texto: sugestao.opcoes.length
        ? sugestao.opcoes.map((o) => `${o.nome}: ${o.valores.join(", ")}`).join(" · ")
        : "Nenhuma citada na legenda.",
    },
    { ok: false, rotulo: "Estoque", texto: "Só você sabe quanto tem. Preencha embaixo." },
  ];

  // destaca o trecho do preço dentro da legenda
  const partes = sugestao.trechoPreco ? legenda.split(sugestao.trechoPreco) : [legenda];

  return (
    <section className="mb-5 rounded-[var(--radius-balao)] bg-white p-4">
      <p className="flex items-center gap-1.5 font-titulo font-bold text-purpura-700">
        <Sparkles size={16} aria-hidden="true" />
        {modelo === "leitura-simples" ? "Lido pela leitura simples" : "Lido pela IA"}
      </p>
      <ul className="mt-3 space-y-2.5">
        {itens.map((item) => (
          <li key={item.rotulo} className="flex gap-2 text-sm">
            {item.ok ? (
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-ok" aria-label="Lido" />
            ) : (
              <CircleAlert size={18} className="mt-0.5 shrink-0 text-[#b26b00]" aria-label="Preencha" />
            )}
            <span>
              <span className="font-medium">{item.rotulo}:</span> {item.texto}
            </span>
          </li>
        ))}
      </ul>
      {legenda ? (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-tinta-suave">Ver legenda</summary>
          <p className="mt-2 whitespace-pre-line rounded-xl bg-areia p-3 text-tinta">
            {partes.map((parte, i) => (
              <span key={i}>
                {parte}
                {i < partes.length - 1 ? (
                  <mark className="rounded bg-purpura-100 px-0.5 text-purpura-900">{sugestao.trechoPreco}</mark>
                ) : null}
              </span>
            ))}
          </p>
        </details>
      ) : null}
    </section>
  );
}

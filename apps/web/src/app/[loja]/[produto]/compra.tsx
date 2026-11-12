"use client";

import { formatarCentavos, linkWhatsapp, nomeVariacao } from "@fenicia/core";
import { Check, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSacola } from "@/lib/sacola";

type Variante = {
  id: string;
  atributos: Record<string, string>;
  precoCentavos: number;
  disponivel: boolean;
  ultimas: boolean;
};

type Props = {
  slugLoja: string;
  whatsapp: string | null;
  cor: string;
  produto: {
    slug: string;
    nome: string;
    opcoes: { nome: string; valores: string[] }[];
    variantes: Variante[];
    capa: string | null;
  };
};

/** Escolha das variações + sacola. Opção esgotada aparece riscada e não dá para escolher. */
export function Compra({ slugLoja, whatsapp, cor, produto }: Props) {
  const { adicionar } = useSacola(slugLoja);
  const unica = produto.opcoes.length === 0;
  const [escolha, setEscolha] = useState<Record<string, string>>({});
  const [adicionado, setAdicionado] = useState(false);

  const variante = unica
    ? produto.variantes[0]
    : produto.variantes.find((v) => produto.opcoes.every((o) => v.atributos[o.nome] === escolha[o.nome]));

  function situacao(opcao: string, valor: string) {
    const candidatas = produto.variantes.filter(
      (v) =>
        v.atributos[opcao] === valor &&
        produto.opcoes.every((o) => o.nome === opcao || !escolha[o.nome] || v.atributos[o.nome] === escolha[o.nome]),
    );
    if (candidatas.length === 0) return "inexistente";
    return candidatas.some((v) => v.disponivel) ? "disponivel" : "esgotado";
  }

  const precos = produto.variantes.map((v) => v.precoCentavos);
  const precoMostrado = variante
    ? formatarCentavos(variante.precoCentavos)
    : Math.min(...precos) === Math.max(...precos)
      ? formatarCentavos(precos[0])
      : `a partir de ${formatarCentavos(Math.min(...precos))}`;

  const falta = produto.opcoes.find((o) => !escolha[o.nome]);

  function colocarNaSacola() {
    if (!variante || !variante.disponivel) return;
    adicionar({
      varianteId: variante.id,
      produtoSlug: produto.slug,
      nome: produto.nome,
      variacao: unica ? null : nomeVariacao(variante.atributos, produto.opcoes.map((o) => o.nome)),
      precoUnitCentavos: variante.precoCentavos,
      capa: produto.capa,
    });
    setAdicionado(true);
  }

  return (
    <>
      <p className="mt-1 font-titulo text-2xl font-bold tabular-nums">{precoMostrado}</p>

      {produto.opcoes.map((o) => (
        <fieldset key={o.nome} className="mt-5">
          <legend className="text-sm font-semibold">
            {o.nome}
            {escolha[o.nome] ? <span className="font-normal text-tinta-suave">: {escolha[o.nome]}</span> : null}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {o.valores.map((valor) => {
              const s = situacao(o.nome, valor);
              const marcado = escolha[o.nome] === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  disabled={s !== "disponivel"}
                  aria-pressed={marcado}
                  onClick={() => {
                    setAdicionado(false);
                    setEscolha((e) => ({ ...e, [o.nome]: valor }));
                  }}
                  className={`h-11 min-w-12 rounded-full border px-4 text-sm font-medium transition disabled:text-tinta-suave/50 ${
                    s === "esgotado" ? "line-through" : ""
                  } ${marcado ? "border-transparent text-white" : "border-linha bg-white"} ${s === "esgotado" ? "border-dashed" : ""}`}
                  style={marcado ? { background: cor } : undefined}
                  aria-label={s === "esgotado" ? `${valor}, esgotado` : valor}
                >
                  {valor}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {variante?.ultimas ? <p className="mt-4 text-sm font-medium text-[#b26b00]">Últimas unidades</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-md gap-2 px-4 py-3">
          {whatsapp ? (
            <a
              href={linkWhatsapp(whatsapp, `Oi! Tenho uma dúvida sobre ${produto.nome}.`)}
              aria-label="Tirar dúvida no WhatsApp"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-linha"
            >
              <MessageCircle size={20} aria-hidden="true" />
            </a>
          ) : null}
          {adicionado ? (
            <Link
              href={`/${slugLoja}/sacola`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full font-semibold text-white"
              style={{ background: cor }}
            >
              <Check size={18} aria-hidden="true" /> Na sacola · Ver sacola
            </Link>
          ) : (
            <button
              type="button"
              onClick={colocarNaSacola}
              disabled={!variante || !variante.disponivel}
              className="h-12 flex-1 rounded-full font-semibold text-white disabled:opacity-40"
              style={{ background: cor }}
            >
              {variante && !variante.disponivel
                ? "Esgotado"
                : falta
                  ? `Escolha ${falta.nome.toLowerCase()}`
                  : "Colocar na sacola"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { nomeVariacao } from "@fenicia/core";
import { Minus, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { movimentarAcao } from "./acoes";

type Variacao = { id: string; atributos: Record<string, string>; estoque: number | null };
type MotivoSaida = "venda" | "perda" | "ajuste";

const MOTIVOS_SAIDA: { valor: MotivoSaida; rotulo: string }[] = [
  { valor: "venda", rotulo: "Venda" },
  { valor: "perda", rotulo: "Perda" },
  { valor: "ajuste", rotulo: "Ajuste" },
];

/** Botões grandes de + e − por variação. O número muda na hora e o servidor confirma. */
export function ControleEstoque({ variacoes, ordem }: { variacoes: Variacao[]; ordem: string[] }) {
  const [estoques, setEstoques] = useState(() => Object.fromEntries(variacoes.map((v) => [v.id, v.estoque])));
  const [motivoSaida, setMotivoSaida] = useState<MotivoSaida>("venda");
  const [erro, setErro] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  function mover(id: string, quantidade: number) {
    const antes = estoques[id];
    const depois = (antes ?? 0) + quantidade;
    if (depois < 0) {
      setErro("O estoque não pode ficar negativo.");
      return;
    }
    setErro(null);
    setEstoques((e) => ({ ...e, [id]: depois })); // mostra já, sem esperar o servidor
    iniciar(async () => {
      const r = await movimentarAcao(id, quantidade, quantidade > 0 ? "entrada" : motivoSaida);
      if (r.ok) setEstoques((e) => ({ ...e, [id]: r.estoque }));
      else {
        setEstoques((e) => ({ ...e, [id]: antes })); // volta o número se o servidor recusar
        setErro(r.erro);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-tinta-suave">O − conta como</span>
        <div role="radiogroup" aria-label="Motivo da saída" className="flex rounded-xl bg-purpura-100 p-1">
          {MOTIVOS_SAIDA.map((m) => (
            <button
              key={m.valor}
              type="button"
              role="radio"
              aria-checked={motivoSaida === m.valor}
              onClick={() => setMotivoSaida(m.valor)}
              className="h-8 rounded-lg px-3 text-purpura-900 aria-checked:bg-white aria-checked:font-medium aria-checked:shadow-sm"
            >
              {m.rotulo}
            </button>
          ))}
        </div>
      </div>

      {erro ? <p role="alert" className="mt-3 text-sm text-erro">{erro}</p> : null}

      <ul className="mt-4 divide-y divide-linha rounded-2xl border border-linha bg-white">
        {variacoes.map((v) => {
          const qtd = estoques[v.id];
          const rotulo = nomeVariacao(v.atributos, ordem);
          return (
            <li key={v.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 truncate font-medium">{rotulo}</span>
              <button
                type="button"
                onClick={() => mover(v.id, -1)}
                aria-label={`Tirar 1 de ${rotulo}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-linha active:bg-purpura-100"
              >
                <Minus size={18} aria-hidden="true" />
              </button>
              <span
                aria-live="polite"
                aria-label={`Estoque de ${rotulo}`}
                className={`w-10 text-center font-titulo text-2xl font-semibold ${qtd === 0 ? "text-erro" : ""}`}
              >
                {qtd ?? "–"}
              </span>
              <button
                type="button"
                onClick={() => mover(v.id, 1)}
                aria-label={`Somar 1 em ${rotulo}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-purpura-700 text-purpura-100 active:opacity-80"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";

type Props = {
  /** Server Action que roda depois do "sim" */
  acao: () => Promise<unknown>;
  titulo: string;
  texto?: string;
  rotuloConfirmar: string;
  perigo?: boolean;
  children: React.ReactNode;
  className?: string;
};

/**
 * Botão que pede confirmação antes de fazer algo que não dá para desfazer sem querer
 * (sair, arquivar produto...). No celular é fácil tocar sem querer.
 */
export function BotaoConfirmar({ acao, titulo, texto, rotuloConfirmar, perigo, children, className }: Props) {
  const [aberto, setAberto] = useState(false);
  const [rodando, iniciar] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={className}>
        {children}
      </button>
      {aberto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmar-titulo"
          className="fixed inset-0 z-50 flex items-end justify-center bg-purpura-950/40 p-4 sm:items-center"
          onClick={() => !rodando && setAberto(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="confirmar-titulo" className="font-titulo text-lg font-semibold">
              {titulo}
            </p>
            {texto ? <p className="mt-1 text-sm text-tinta-suave">{texto}</p> : null}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAberto(false)}
                disabled={rodando}
                className="h-11 rounded-xl border border-linha font-medium"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={rodando}
                onClick={() => iniciar(async () => {
                  await acao();
                  setAberto(false);
                })}
                className={`h-11 rounded-xl font-medium text-white disabled:opacity-70 ${
                  perigo ? "bg-erro" : "bg-purpura-700"
                }`}
              >
                {rodando ? "Um momento…" : rotuloConfirmar}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

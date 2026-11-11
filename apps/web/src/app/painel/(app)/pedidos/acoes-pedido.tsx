"use client";

import { ACAO_STATUS, podeCancelar, proximoStatus, type StatusPedido } from "@fenicia/core";
import { useState, useTransition } from "react";
import { BotaoConfirmar } from "@/components/confirmar";
import { mudarStatusAcao } from "./acoes";

/** Botão do próximo passo + cancelar (com confirmação). */
export function AcoesPedido({ pedidoId, status }: { pedidoId: string; status: StatusPedido }) {
  const [erro, setErro] = useState<string | null>(null);
  const [rodando, iniciar] = useTransition();
  const proximo = proximoStatus(status);

  function avancar() {
    if (!proximo) return;
    setErro(null);
    iniciar(async () => {
      const r = await mudarStatusAcao(pedidoId, proximo);
      if (!r.ok) setErro(r.erro);
    });
  }

  async function cancelar() {
    setErro(null);
    const r = await mudarStatusAcao(pedidoId, "cancelado");
    if (!r.ok) setErro(r.erro);
  }

  if (!proximo && !podeCancelar(status)) return null;

  return (
    <div className="mt-3">
      {erro ? <p role="alert" className="mb-2 rounded-lg bg-[#f8e4e1] px-3 py-2 text-sm text-erro">{erro}</p> : null}
      <div className="flex gap-2">
        {proximo ? (
          <button
            type="button"
            onClick={avancar}
            disabled={rodando}
            className="h-11 flex-1 rounded-xl bg-purpura-700 text-sm font-medium text-purpura-100 disabled:opacity-70"
          >
            {rodando ? "Salvando…" : ACAO_STATUS[status]}
          </button>
        ) : null}
        {podeCancelar(status) ? (
          <BotaoConfirmar
            acao={cancelar}
            titulo="Cancelar pedido?"
            texto={
              status === "novo"
                ? "O pedido sai da lista de novos. O estoque não muda."
                : "O estoque que foi baixado por esse pedido volta para a loja."
            }
            rotuloConfirmar="Cancelar pedido"
            perigo
            className="h-11 rounded-xl border border-linha px-4 text-sm font-medium text-erro"
          >
            Cancelar
          </BotaoConfirmar>
        ) : null}
      </div>
    </div>
  );
}

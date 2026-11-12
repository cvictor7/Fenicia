"use client";

import { Check, Copy } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

/** Mostra o link completo da vitrine e copia com um toque. */
export function CopiarLink({ caminho }: { caminho: string }) {
  const origem = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "",
  );
  const [copiado, setCopiado] = useState(false);
  const link = `${origem}${caminho}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="mt-1 flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="min-w-0 truncate font-titulo text-lg font-bold">{link}</span>
      <span className="flex shrink-0 items-center gap-1 text-sm text-sobre-purpura-suave">
        {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {copiado ? "Copiado" : "Copiar"}
      </span>
    </button>
  );
}

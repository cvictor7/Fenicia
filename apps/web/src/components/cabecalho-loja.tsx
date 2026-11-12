/** Esqueleto enquanto a tela carrega: já mostra a faixa púrpura para não "piscar". */
export function Carregando() {
  return (
    <div aria-label="Carregando" role="status">
      <div className="-mx-4 -mt-6 mb-5 h-28 bg-purpura-700" />
      <div className="animate-pulse space-y-3">
        <div className="h-24 rounded-[var(--radius-balao)] bg-linha/60" />
        <div className="h-24 rounded-[var(--radius-balao)] bg-linha/40" />
      </div>
    </div>
  );
}

/** Tela vazia: uma letra fenícia grande e um convite para agir. */
export function Vazio({
  letra = "𐤀",
  titulo,
  texto,
  children,
}: {
  letra?: string;
  titulo: string;
  texto: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span aria-hidden="true" className="font-fenicio text-7xl leading-none text-purpura-200">
        {letra}
      </span>
      <p className="mt-5 font-titulo text-xl font-bold">{titulo}</p>
      <p className="mt-1 max-w-xs text-tinta-suave">{texto}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

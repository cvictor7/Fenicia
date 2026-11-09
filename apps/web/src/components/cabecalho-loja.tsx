import { Selo } from "./logo";

export function CabecalhoLoja({ nome, slug }: { nome: string; slug: string }) {
  return (
    <header className="flex min-w-0 items-center gap-2.5">
      <Selo tamanho={32} />
      <div className="min-w-0">
        <p className="truncate font-titulo text-lg font-semibold leading-tight">{nome}</p>
        <p className="truncate text-sm text-tinta-suave">/{slug}</p>
      </div>
    </header>
  );
}

export function Carregando() {
  return (
    <div className="animate-pulse space-y-3" aria-label="Carregando">
      <div className="h-8 w-2/3 rounded-lg bg-linha/60" />
      <div className="h-24 rounded-2xl bg-linha/40" />
      <div className="h-24 rounded-2xl bg-linha/40" />
    </div>
  );
}

/** Tela vazia com a letra fenícia como ilustração. */
export function Vazio({ letra = "𐤀", titulo, texto, children }: {
  letra?: string;
  titulo: string;
  texto: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-linha bg-white px-6 py-10 text-center">
      <span aria-hidden="true" className="font-fenicio text-6xl leading-none text-purpura-500">
        {letra}
      </span>
      <p className="mt-4 font-medium">{titulo}</p>
      <p className="mt-1 text-sm text-tinta-suave">{texto}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

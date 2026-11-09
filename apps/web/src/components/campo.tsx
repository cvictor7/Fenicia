import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  dica?: string;
  erro?: string;
};

/** Campo de formulário com rótulo, dica e erro, pensado para o celular (letra 16px evita zoom no iPhone). */
export function Campo({ rotulo, dica, erro, id, ...resto }: Props) {
  const campoId = id ?? resto.name;
  return (
    <label htmlFor={campoId} className="block">
      <span className="mb-1.5 block text-sm font-medium">{rotulo}</span>
      <input
        id={campoId}
        className="block h-12 w-full rounded-xl border border-linha bg-white px-3.5 text-base outline-none transition focus:border-purpura-700 focus:ring-2 focus:ring-purpura-100 aria-invalid:border-erro"
        aria-invalid={erro ? true : undefined}
        {...resto}
      />
      {erro ? (
        <span className="mt-1.5 block text-sm text-erro">{erro}</span>
      ) : dica ? (
        <span className="mt-1.5 block text-sm text-tinta-suave">{dica}</span>
      ) : null}
    </label>
  );
}

export function BotaoPrincipal({
  children,
  carregando,
}: {
  children: React.ReactNode;
  carregando?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={carregando}
      className="h-12 w-full rounded-xl bg-purpura-700 font-medium text-purpura-100 transition active:scale-[0.99] disabled:opacity-70"
    >
      {carregando ? "Um momento…" : children}
    </button>
  );
}

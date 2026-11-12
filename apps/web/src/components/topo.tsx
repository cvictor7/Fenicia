import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Faixa púrpura no topo das telas do painel. É a marca da Fenícia:
 * a cor ocupa o espaço em vez de aparecer só em botões.
 */
export function Topo({
  titulo,
  subtitulo,
  voltar,
  acao,
  children,
}: {
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  voltar?: string;
  acao?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="-mx-4 -mt-6 mb-5 bg-purpura-700 px-4 pb-6 pt-5 text-sobre-purpura">
      <div className="flex items-center gap-2">
        {voltar ? (
          <Link
            href={voltar}
            aria-label="Voltar"
            className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 font-titulo text-[26px] font-bold leading-tight tracking-tight">{titulo}</h1>
          {subtitulo ? <p className="truncate text-sm text-sobre-purpura-suave">{subtitulo}</p> : null}
        </div>
        {acao}
      </div>
      {children}
    </header>
  );
}

/** Botão claro para usar dentro da faixa púrpura. */
export function AcaoTopo({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-sobre-purpura px-4 text-sm font-semibold text-purpura-700"
    >
      {children}
    </Link>
  );
}

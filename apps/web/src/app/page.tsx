import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Inicio() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Logo tamanho={40} />
      <h1 className="mt-10 font-titulo text-4xl font-semibold leading-tight tracking-tight">
        O post vira produto.
        <br />
        A conversa vira venda.
      </h1>
      <p className="mt-4 text-lg text-tinta-suave">
        Para quem vende pelo Instagram e pelo WhatsApp. Você continua vendendo do mesmo jeito; a
        Fenícia cuida do catálogo, do estoque e dos pedidos.
      </p>
      <Link
        href="/entrar"
        className="mt-8 flex h-12 items-center justify-center rounded-xl bg-purpura-700 font-medium text-purpura-100"
      >
        Entrar no painel
      </Link>
      <p className="mt-6 text-center text-sm text-tinta-suave">Em construção · Fase 1</p>
    </main>
  );
}

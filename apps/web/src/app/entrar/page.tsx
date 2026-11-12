import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { ListaPassos } from "@/components/passos";
import { sessaoAtual } from "@/lib/sessao";
import { FormularioAcesso } from "./formulario";

export const metadata: Metadata = { title: "Entrar" };

type Params = Promise<{ modo?: string }>;

/** Quem já está logado vai direto para o painel. */
async function RedirecionarSeLogado() {
  if (await sessaoAtual()) redirect("/painel");
  return null;
}

async function Formulario({ searchParams }: { searchParams: Params }) {
  const { modo } = await searchParams;
  return <FormularioAcesso modoInicial={modo === "criar" ? "criar" : "entrar"} />;
}

export default function PaginaEntrar({ searchParams }: { searchParams: Params }) {
  return (
    <main className="flex min-h-dvh flex-col bg-purpura-700">
      <Suspense>
        <RedirecionarSeLogado />
      </Suspense>
      <div className="mx-auto w-full max-w-md px-5 pb-9 pt-6 text-sobre-purpura">
        <Logo tamanho={32} claro />
        <h1 className="mt-8 font-titulo text-[38px] font-extrabold leading-[0.98] tracking-tight">
          Você vende.
          <br />
          A Fenícia organiza.
        </h1>
        <div className="mt-7">
          <ListaPassos compacta />
        </div>
      </div>
      {/* a folha do formulário vai até o fim da tela: sem sobra de fundo vazio */}
      <div className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-md flex-1 rounded-t-[28px] bg-areia px-5 pb-10 pt-6">
          <Suspense fallback={<div className="h-72" />}>
            <Formulario searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

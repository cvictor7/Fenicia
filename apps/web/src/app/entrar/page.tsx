import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { sessaoAtual } from "@/lib/sessao";
import { FormularioAcesso } from "./formulario";

export const metadata: Metadata = { title: "Entrar" };

/** Quem já está logado vai direto para o painel. */
async function RedirecionarSeLogado() {
  if (await sessaoAtual()) redirect("/painel");
  return null;
}

export default function PaginaEntrar() {
  return (
    <main className="min-h-dvh">
      <Suspense>
        <RedirecionarSeLogado />
      </Suspense>
      <div className="bg-purpura-700 text-sobre-purpura">
        <div className="mx-auto max-w-md px-5 pb-10 pt-7">
          <Logo tamanho={32} claro />
          <h1 className="mt-10 font-titulo text-[40px] font-extrabold leading-[0.98] tracking-tight">
            Você vende.
            <br />
            A Fenícia organiza.
          </h1>
        </div>
      </div>
      <div className="mx-auto -mt-5 max-w-md rounded-t-[28px] bg-areia px-5 pt-6">
        <FormularioAcesso />
      </div>
    </main>
  );
}

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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-8">
      <Suspense>
        <RedirecionarSeLogado />
      </Suspense>
      <Logo tamanho={36} />
      <h1 className="mt-10 font-titulo text-3xl font-semibold tracking-tight">
        O post vira produto.
      </h1>
      <p className="mt-2 text-tinta-suave">
        Entre para cuidar da sua loja: produtos, estoque e pedidos no mesmo lugar.
      </p>
      <div className="mt-8">
        <FormularioAcesso />
      </div>
    </main>
  );
}

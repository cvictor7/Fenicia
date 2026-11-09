import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { exigirSessao, lojaDoUsuario } from "@/lib/sessao";
import { FormularioLoja } from "./formulario";

export const metadata: Metadata = { title: "Criar loja" };

/** Só entra quem está logado e ainda não tem loja. */
async function Porteiro() {
  const sessao = await exigirSessao();
  if (await lojaDoUsuario(sessao.user.id)) redirect("/painel");
  return <FormularioLoja />;
}

export default function PaginaCriarLoja() {
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <Logo tamanho={32} />
      <h1 className="mt-8 font-titulo text-2xl font-semibold tracking-tight">Sua loja</h1>
      <p className="mt-1 text-tinta-suave">Leva 1 minuto. Dá para mudar tudo depois.</p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-tinta-suave">Carregando…</p>}>
          <Porteiro />
        </Suspense>
      </div>
    </main>
  );
}

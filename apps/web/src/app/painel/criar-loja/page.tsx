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
    <main className="min-h-dvh">
      <div className="bg-purpura-700 text-sobre-purpura">
        <div className="mx-auto max-w-md px-5 pb-10 pt-7">
          <Logo tamanho={32} claro />
          <h1 className="mt-8 font-titulo text-[34px] font-extrabold leading-tight tracking-tight">Agora, sua loja</h1>
          <p className="mt-1 text-sobre-purpura-suave">Leva 1 minuto. Dá para mudar tudo depois.</p>
        </div>
      </div>
      <div className="mx-auto -mt-5 max-w-md rounded-t-[28px] bg-areia px-5 pb-10 pt-6">
        <Suspense fallback={<p className="text-tinta-suave">Carregando…</p>}>
          <Porteiro />
        </Suspense>
      </div>
    </main>
  );
}

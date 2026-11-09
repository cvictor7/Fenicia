import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Selo } from "@/components/logo";
import { exigirSessao, lojaDoUsuario } from "@/lib/sessao";
import { sair } from "../entrar/acoes";

export const metadata: Metadata = { title: "Painel" };

async function ConteudoPainel() {
  const sessao = await exigirSessao();
  const vinculo = await lojaDoUsuario(sessao.user.id);
  if (!vinculo) redirect("/painel/criar-loja");
  const { loja } = vinculo;
  const primeiroNome = sessao.user.name.split(" ")[0];

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Selo tamanho={32} />
          <div className="min-w-0">
            <p className="truncate font-titulo text-lg font-semibold leading-tight">{loja.nome}</p>
            <p className="truncate text-sm text-tinta-suave">/{loja.slug}</p>
          </div>
        </div>
        <form action={sair}>
          <button className="h-9 rounded-lg px-3 text-sm text-tinta-suave hover:bg-purpura-100">
            Sair
          </button>
        </form>
      </header>

      <h1 className="mt-8 font-titulo text-2xl font-semibold tracking-tight">
        Olá, {primeiroNome}
      </h1>
      <p className="mt-1 text-tinta-suave">Sua loja está criada. O próximo passo é o primeiro produto.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          ["Produtos", "0"],
          ["Pedidos novos", "0"],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-2xl border border-linha bg-white p-4">
            <p className="text-sm text-tinta-suave">{rotulo}</p>
            <p className="mt-1 font-titulo text-3xl font-semibold">{valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-linha bg-white px-6 py-10 text-center">
        <span aria-hidden="true" className="font-fenicio text-6xl leading-none text-purpura-500">
          𐤀
        </span>
        <p className="mt-4 font-medium">Nenhum produto ainda</p>
        <p className="mt-1 text-sm text-tinta-suave">
          Em breve: suba a foto e a legenda do post e a Fenícia monta o produto para você.
        </p>
      </div>
    </>
  );
}

export default function PaginaPainel() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <Suspense fallback={<p className="text-tinta-suave">Carregando…</p>}>
        <ConteudoPainel />
      </Suspense>
    </main>
  );
}

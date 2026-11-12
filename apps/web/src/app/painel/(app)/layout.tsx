import { contarPedidosNovos, obterBanco } from "@fenicia/db";
import { Suspense } from "react";
import { Navegacao } from "@/components/navegacao";
import { obterContexto } from "@/lib/contexto";

async function NavegacaoComContagem() {
  const { loja } = await obterContexto();
  const novos = await contarPedidosNovos(await obterBanco(), loja.id);
  return <Navegacao pedidosNovos={novos} />;
}

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto max-w-md px-4 pb-28 pt-6">{children}</main>
      <Suspense fallback={<Navegacao />}>
        <NavegacaoComContagem />
      </Suspense>
    </>
  );
}

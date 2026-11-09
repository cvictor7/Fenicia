import type { Metadata } from "next";
import Link from "next/link";
import { Vazio } from "@/components/cabecalho-loja";

export const metadata: Metadata = { title: "Novo post" };

export default function PaginaNovoPost() {
  return (
    <>
      <h1 className="font-titulo text-2xl font-semibold tracking-tight">Novo post</h1>
      <div className="mt-5">
        <Vazio
          letra="𐤁"
          titulo="Do post ao produto"
          texto="Em breve: você sobe a foto e a legenda do jeito que postaria no Instagram, e a Fenícia preenche nome, variações e preço para você conferir."
        >
          <Link href="/painel/produtos/novo" className="inline-flex h-11 items-center rounded-xl border border-linha px-5 font-medium">
            Cadastrar à mão por enquanto
          </Link>
        </Vazio>
      </div>
    </>
  );
}

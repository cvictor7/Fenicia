import { resumoProdutos, obterBanco } from "@fenicia/db";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CabecalhoLoja, Carregando, Vazio } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";

export const metadata: Metadata = { title: "Painel" };

async function Inicio() {
  const { loja, usuario } = await obterContexto();
  const resumo = await resumoProdutos(await obterBanco(), loja.id);
  const primeiroNome = usuario.name.split(" ")[0];

  const cartoes = [
    { rotulo: "Produtos", valor: resumo.total, href: "/painel/produtos" },
    { rotulo: "Publicados", valor: resumo.publicados, href: "/painel/produtos?filtro=publicados" },
    { rotulo: "Sem estoque", valor: resumo.semEstoque, href: "/painel/produtos?filtro=sem-estoque", alerta: resumo.semEstoque > 0 },
    { rotulo: "Pedidos novos", valor: 0, href: "/painel/pedidos" },
  ];

  return (
    <>
      <CabecalhoLoja nome={loja.nome} slug={loja.slug} />
      <h1 className="mt-8 font-titulo text-2xl font-semibold tracking-tight">Olá, {primeiroNome}</h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {cartoes.map((c) => (
          <Link key={c.rotulo} href={c.href} className="rounded-2xl border border-linha bg-white p-4 active:bg-purpura-100/40">
            <p className="text-sm text-tinta-suave">{c.rotulo}</p>
            <p className={`mt-1 font-titulo text-3xl font-semibold ${c.alerta ? "text-erro" : ""}`}>{c.valor}</p>
          </Link>
        ))}
      </div>

      {resumo.total === 0 ? (
        <div className="mt-6">
          <Vazio titulo="Nenhum produto ainda" texto="Cadastre o primeiro. Em breve dá para só subir o post e a Fenícia monta o produto.">
            <Link href="/painel/produtos/novo" className="inline-flex h-11 items-center gap-2 rounded-xl bg-purpura-700 px-5 font-medium text-purpura-100">
              <Plus size={18} aria-hidden="true" /> Cadastrar produto
            </Link>
          </Vazio>
        </div>
      ) : (
        <Link href="/painel/produtos/novo" className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-purpura-700 font-medium text-purpura-100">
          <Plus size={18} aria-hidden="true" /> Cadastrar produto
        </Link>
      )}
    </>
  );
}

export default function PaginaInicio() {
  return (
    <Suspense fallback={<Carregando />}>
      <Inicio />
    </Suspense>
  );
}

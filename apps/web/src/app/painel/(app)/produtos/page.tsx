import { formatarCentavos } from "@fenicia/core";
import { listarProdutosResumo, obterBanco, type FiltroProdutos } from "@fenicia/db";
import { ChevronRight, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Vazio } from "@/components/cabecalho-loja";
import { obterContexto } from "@/lib/contexto";

export const metadata: Metadata = { title: "Produtos" };

const filtros: { valor: FiltroProdutos; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "publicados", rotulo: "Publicados" },
  { valor: "rascunhos", rotulo: "Rascunhos" },
  { valor: "sem-estoque", rotulo: "Sem estoque" },
  { valor: "arquivados", rotulo: "Arquivados" },
];

type Params = Promise<{ filtro?: string; busca?: string }>;

function textoEstoque(estoque: number | null) {
  if (estoque == null) return { texto: "Estoque não informado", cor: "text-tinta-suave" };
  if (estoque === 0) return { texto: "Sem estoque", cor: "text-erro" };
  return { texto: `${estoque} em estoque`, cor: "text-tinta-suave" };
}

async function Lista({ searchParams }: { searchParams: Params }) {
  const { filtro: f, busca = "" } = await searchParams;
  const filtro = (filtros.some((x) => x.valor === f) ? f : "todos") as FiltroProdutos;
  const { loja } = await obterContexto();
  const produtos = await listarProdutosResumo(await obterBanco(), loja.id, filtro, busca);

  return (
    <>
      <form className="relative mt-4" role="search">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-suave" aria-hidden="true" />
        {filtro !== "todos" ? <input type="hidden" name="filtro" value={filtro} /> : null}
        <input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar produto"
          aria-label="Buscar produto"
          className="h-11 w-full rounded-xl border border-linha bg-white pl-10 pr-3 text-base outline-none focus:border-purpura-700"
        />
      </form>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {filtros.map((x) => (
          <Link
            key={x.valor}
            href={x.valor === "todos" ? "/painel/produtos" : `/painel/produtos?filtro=${x.valor}`}
            aria-current={filtro === x.valor ? "true" : undefined}
            className="h-9 shrink-0 rounded-full border border-linha bg-white px-4 text-sm leading-9 aria-[current=true]:border-purpura-700 aria-[current=true]:bg-purpura-700 aria-[current=true]:text-purpura-100"
          >
            {x.rotulo}
          </Link>
        ))}
      </div>

      {produtos.length === 0 ? (
        <div className="mt-5">
          <Vazio
            titulo={busca || filtro !== "todos" ? "Nada encontrado" : "Nenhum produto ainda"}
            texto={busca || filtro !== "todos" ? "Tente outro filtro ou outra busca." : "Cadastre o primeiro produto da loja."}
          />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-linha overflow-hidden rounded-2xl border border-linha bg-white">
          {produtos.map((p) => {
            const estoque = textoEstoque(p.estoque);
            return (
              <li key={p.id}>
                <Link href={`/painel/produtos/${p.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-purpura-100/40">
                  {p.capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.capa} alt="" className="h-14 w-11 shrink-0 rounded-lg object-cover" loading="lazy" />
                  ) : (
                    <span aria-hidden="true" className="flex h-14 w-11 shrink-0 items-center justify-center rounded-lg bg-purpura-100 font-fenicio text-xl text-purpura-500">
                      𐤀
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{p.nome}</p>
                      {p.status !== "publicado" ? (
                        <span className="shrink-0 rounded-md bg-purpura-100 px-1.5 py-0.5 text-[11px] text-purpura-900">
                          {p.status === "rascunho" ? "Rascunho" : "Arquivado"}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm">
                      <span>{p.precoCentavos != null ? formatarCentavos(p.precoCentavos) : "Sem preço"}</span>
                      <span className="text-tinta-suave"> · </span>
                      <span className={estoque.cor}>{estoque.texto}</span>
                      {p.variacoes > 1 ? <span className="text-tinta-suave"> · {p.variacoes} variações</span> : null}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-tinta-suave" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function PaginaProdutos({ searchParams }: { searchParams: Params }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-titulo text-2xl font-semibold tracking-tight">Produtos</h1>
        <Link href="/painel/produtos/novo" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-purpura-700 px-4 text-sm font-medium text-purpura-100">
          <Plus size={16} aria-hidden="true" /> Novo
        </Link>
      </div>
      <Suspense fallback={<div className="mt-4"><Carregando /></div>}>
        <Lista searchParams={searchParams} />
      </Suspense>
    </>
  );
}

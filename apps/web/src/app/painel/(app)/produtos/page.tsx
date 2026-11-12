import { formatarCentavos } from "@fenicia/core";
import { listarProdutosResumo, obterBanco, type FiltroProdutos } from "@fenicia/db";
import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Vazio } from "@/components/cabecalho-loja";
import { AcaoTopo, Topo } from "@/components/topo";
import { obterContexto } from "@/lib/contexto";

export const metadata: Metadata = { title: "Produtos" };

const filtros: { valor: FiltroProdutos; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "publicados", rotulo: "Na vitrine" },
  { valor: "rascunhos", rotulo: "Rascunhos" },
  { valor: "sem-estoque", rotulo: "Sem estoque" },
  { valor: "arquivados", rotulo: "Arquivados" },
];

type Params = Promise<{ filtro?: string; busca?: string }>;

function Estoque({ estoque }: { estoque: number | null }) {
  if (estoque == null) return <span className="text-tinta-suave">estoque não informado</span>;
  if (estoque === 0) return <span className="font-semibold text-erro">sem estoque</span>;
  if (estoque <= 2) return <span className="font-semibold text-[#9a4a00]">restam {estoque}</span>;
  return <span className="text-tinta-suave">{estoque} em estoque</span>;
}

async function Lista({ searchParams }: { searchParams: Params }) {
  const { filtro: f, busca = "" } = await searchParams;
  const filtro = (filtros.some((x) => x.valor === f) ? f : "todos") as FiltroProdutos;
  const { loja } = await obterContexto();
  const produtos = await listarProdutosResumo(await obterBanco(), loja.id, filtro, busca);

  return (
    <>
      <Topo
        titulo="Produtos"
        subtitulo={`${produtos.length} ${produtos.length === 1 ? "produto" : "produtos"}`}
        acao={
          <AcaoTopo href="/painel/produtos/novo">
            <Plus size={16} aria-hidden="true" /> Novo
          </AcaoTopo>
        }
      >
        <form className="relative mt-5" role="search">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sobre-purpura-suave" aria-hidden="true" />
          {filtro !== "todos" ? <input type="hidden" name="filtro" value={filtro} /> : null}
          <input
            name="busca"
            defaultValue={busca}
            placeholder="Buscar produto"
            aria-label="Buscar produto"
            className="h-11 w-full rounded-full bg-white/12 pl-11 pr-4 text-base text-white outline-none placeholder:text-sobre-purpura-suave focus:bg-white/20"
          />
        </form>
      </Topo>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {filtros.map((x) => (
          <Link
            key={x.valor}
            href={x.valor === "todos" ? "/painel/produtos" : `/painel/produtos?filtro=${x.valor}`}
            aria-current={filtro === x.valor ? "true" : undefined}
            className="h-9 shrink-0 rounded-full border border-linha px-4 text-sm leading-[34px] aria-[current=true]:border-purpura-700 aria-[current=true]:bg-purpura-700 aria-[current=true]:font-semibold aria-[current=true]:text-sobre-purpura"
          >
            {x.rotulo}
          </Link>
        ))}
      </div>

      {produtos.length === 0 ? (
        <Vazio
          titulo={busca || filtro !== "todos" ? "Nada encontrado" : "Nenhum produto ainda"}
          texto={busca || filtro !== "todos" ? "Tente outro filtro ou outra busca." : "Suba um post do Instagram e a Fenícia monta o primeiro produto."}
        >
          {busca || filtro !== "todos" ? null : (
            <Link href="/painel/novo-post" className="inline-flex h-11 items-center rounded-full bg-purpura-700 px-5 font-semibold text-sobre-purpura">
              Subir um post
            </Link>
          )}
        </Vazio>
      ) : (
        <ul className="mt-3 divide-y divide-linha">
          {produtos.map((p) => (
            <li key={p.id}>
              <Link href={`/painel/produtos/${p.id}`} className="flex items-center gap-3.5 py-3">
                {p.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.capa} alt="" className="h-[72px] w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                ) : (
                  <span aria-hidden="true" className="flex h-[72px] w-14 shrink-0 items-center justify-center rounded-md bg-purpura-100 font-fenicio text-2xl text-purpura-500">
                    𐤀
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-titulo text-[17px] font-bold leading-tight">{p.nome}</p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold tabular-nums">
                      {p.precoCentavos != null ? formatarCentavos(p.precoCentavos) : "sem preço"}
                    </span>
                    <span className="text-tinta-suave">{p.variacoes > 1 ? ` · ${p.variacoes} variações` : ""}</span>
                  </p>
                  <p className="mt-0.5 text-sm">
                    <Estoque estoque={p.estoque} />
                    {p.status !== "publicado" ? (
                      <span className="text-tinta-suave"> · {p.status === "rascunho" ? "rascunho" : "arquivado"}</span>
                    ) : null}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function PaginaProdutos({ searchParams }: { searchParams: Params }) {
  return (
    <Suspense fallback={<Carregando />}>
      <Lista searchParams={searchParams} />
    </Suspense>
  );
}

import { listarPedidos, obterBanco } from "@fenicia/db";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Vazio } from "@/components/cabecalho-loja";
import { Topo } from "@/components/topo";
import { obterContexto } from "@/lib/contexto";
import { CartaoPedido } from "./cartao-pedido";

export const metadata: Metadata = { title: "Pedidos" };

const ABAS = [
  { valor: "novos", rotulo: "Novos", status: ["novo"] },
  { valor: "andamento", rotulo: "Em andamento", status: ["confirmado", "pago", "enviado"] },
  { valor: "concluidos", rotulo: "Concluídos", status: ["entregue", "cancelado"] },
] as const;

type Params = Promise<{ aba?: string }>;

async function Lista({ searchParams }: { searchParams: Params }) {
  const { aba: valorAba } = await searchParams;
  const aba = ABAS.find((a) => a.valor === valorAba) ?? ABAS[0];
  const { loja } = await obterContexto();
  const todos = await listarPedidos(await obterBanco(), loja.id);
  const contagem = Object.fromEntries(
    ABAS.map((a) => [a.valor, todos.filter((p) => (a.status as readonly string[]).includes(p.status)).length]),
  );
  const pedidos = todos.filter((p) => (aba.status as readonly string[]).includes(p.status));

  return (
    <>
      <Topo titulo="Pedidos" subtitulo="Os pedidos da vitrine chegam aqui e no seu WhatsApp">
        <nav aria-label="Etapas dos pedidos" className="-mb-6 mt-5 flex gap-5 text-sm">
          {ABAS.map((a) => (
            <Link
              key={a.valor}
              aria-current={a.valor === aba.valor ? "page" : undefined}
              href={a.valor === "novos" ? "/painel/pedidos" : `/painel/pedidos?aba=${a.valor}`}
              className="border-b-[3px] border-transparent pb-2.5 text-sobre-purpura-suave aria-[current=page]:border-murex aria-[current=page]:font-semibold aria-[current=page]:text-white"
            >
              {a.rotulo}
              {contagem[a.valor] ? <span className="ml-1 opacity-70">{contagem[a.valor]}</span> : null}
            </Link>
          ))}
        </nav>
      </Topo>

      {pedidos.length === 0 ? (
        <Vazio
          letra="𐤂"
          titulo={todos.length === 0 ? "Nenhum pedido ainda" : "Nada nesta etapa"}
          texto={
            todos.length === 0
              ? "Mande o link da sua vitrine para os clientes. Quando alguém pedir, o pedido aparece aqui."
              : "Os pedidos aparecem aqui quando chegarem nessa etapa."
          }
        />
      ) : (
        <ul className="space-y-3">
          {pedidos.map((p) => (
            <li key={p.id}>
              <CartaoPedido pedido={p} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function PaginaPedidos({ searchParams }: { searchParams: Params }) {
  return (
    <Suspense fallback={<Carregando />}>
      <Lista searchParams={searchParams} />
    </Suspense>
  );
}

"use client";

import { formatarCentavos, formatarNumeroPedido } from "@fenicia/core";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useSacola } from "@/lib/sacola";
import { fazerPedidoAcao } from "./acoes";

type Props = { slug: string; nomeLoja: string; cor: string };

export function Sacola({ slug, nomeLoja, cor }: Props) {
  const { itens, mudarQuantidade, limpar, totalCentavos } = useSacola(slug);
  const [nome, setNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [site, setSite] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState<{ numero: number; link: string } | null>(null);
  const [enviando, iniciar] = useTransition();

  function pedir() {
    setErro(null);
    iniciar(async () => {
      const r = await fazerPedidoAcao(slug, {
        itens: itens.map((i) => ({ varianteId: i.varianteId, quantidade: i.quantidade })),
        nome,
        observacao,
        site,
      });
      if (!r.ok) {
        setErro(r.erro);
        return;
      }
      setFeito({ numero: r.numero, link: r.link });
      limpar();
      window.location.href = r.link; // abre o WhatsApp com a mensagem pronta
    });
  }

  const voltar = (
    <Link href={`/${slug}`} className="-ml-2 inline-flex h-10 items-center gap-1 rounded-xl px-2 text-sm font-medium">
      <ArrowLeft size={18} aria-hidden="true" /> {nomeLoja}
    </Link>
  );

  if (feito) {
    return (
      <>
        {voltar}
        <div className="mt-10 text-center">
          <p className="font-titulo text-2xl font-semibold">Pedido {formatarNumeroPedido(feito.numero)} feito</p>
          <p className="mt-2 text-tinta-suave">Agora é só enviar a mensagem no WhatsApp da loja.</p>
          <a href={feito.link} className="mt-6 inline-flex h-12 items-center rounded-xl px-6 font-medium text-white" style={{ background: cor }}>
            Abrir o WhatsApp
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      {voltar}
      <h1 className="mt-3 font-titulo text-2xl font-semibold tracking-tight">Sua sacola</h1>

      {itens.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-tinta-suave">A sacola está vazia.</p>
          <Link href={`/${slug}`} className="mt-4 inline-flex h-11 items-center rounded-xl border border-linha bg-white px-5 font-medium">
            Ver produtos
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-linha rounded-2xl border border-linha bg-white">
            {itens.map((item) => (
              <li key={item.varianteId} className="flex gap-3 p-3">
                {item.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.capa} alt="" className="h-20 w-16 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-20 w-16 shrink-0 rounded-lg bg-linha/40" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/${slug}/${item.produtoSlug}`} className="line-clamp-2 text-sm font-medium leading-snug">
                    {item.nome}
                  </Link>
                  {item.variacao ? <p className="text-sm text-tinta-suave">{item.variacao}</p> : null}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-xl border border-linha">
                      <button
                        type="button"
                        onClick={() => mudarQuantidade(item.varianteId, item.quantidade - 1)}
                        aria-label={item.quantidade === 1 ? `Tirar ${item.nome} da sacola` : `Diminuir ${item.nome}`}
                        className="flex h-9 w-9 items-center justify-center"
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center text-sm" aria-label="Quantidade">{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => mudarQuantidade(item.varianteId, item.quantidade + 1)}
                        aria-label={`Aumentar ${item.nome}`}
                        className="flex h-9 w-9 items-center justify-center"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-sm font-medium">{formatarCentavos(item.precoUnitCentavos * item.quantidade)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Seu nome (opcional)</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="given-name"
                className="block h-12 w-full rounded-xl border border-linha bg-white px-3.5 text-base outline-none focus:border-tinta"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Observação (opcional)</span>
              <input
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex.: entrega no bairro tal"
                className="block h-12 w-full rounded-xl border border-linha bg-white px-3.5 text-base outline-none focus:border-tinta"
              />
            </label>
            <input
              value={site}
              onChange={(e) => setSite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px opacity-0"
              name="site"
            />
          </div>

          <p className="mt-5 text-sm text-tinta-suave">
            Você combina pagamento e entrega direto com a loja, pelo WhatsApp.
          </p>
          {erro ? <p role="alert" className="mt-3 rounded-xl bg-[#f8e4e1] px-3.5 py-3 text-sm text-erro">{erro}</p> : null}

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
              <div className="shrink-0">
                <p className="text-xs text-tinta-suave">Total</p>
                <p className="font-titulo text-lg font-semibold">{formatarCentavos(totalCentavos)}</p>
              </div>
              <button
                type="button"
                onClick={pedir}
                disabled={enviando}
                className="h-12 flex-1 rounded-xl font-medium text-white disabled:opacity-70"
                style={{ background: cor }}
              >
                {enviando ? "Enviando…" : "Pedir no WhatsApp"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

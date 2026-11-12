"use client";

import { useState } from "react";

/** Fotos de ponta a ponta, deslizando como no Instagram, com os pontinhos embaixo. */
export function Galeria({ imagens, nome, cor }: { imagens: { url: string }[]; nome: string; cor: string }) {
  const [atual, setAtual] = useState(0);
  if (imagens.length === 0) return <div className="-mx-4 aspect-[4/5] bg-linha/50" />;

  return (
    <div className="-mx-4">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        onScroll={(e) => {
          const el = e.currentTarget;
          setAtual(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {imagens.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.url}
            src={img.url}
            alt={`${nome}, foto ${i + 1} de ${imagens.length}`}
            className="aspect-[4/5] w-full shrink-0 snap-center object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      {imagens.length > 1 ? (
        <div className="mt-2.5 flex justify-center gap-1.5" aria-hidden="true">
          {imagens.map((img, i) => (
            <span
              key={img.url}
              className="h-1.5 w-1.5 rounded-full transition-colors"
              style={{ background: i === atual ? cor : "var(--color-linha)" }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

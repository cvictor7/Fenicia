/** Logo da Fenícia: a letra alef (𐤀), avó do nosso "A", num selo púrpura + o nome. */
export function Selo({ tamanho = 32 }: { tamanho?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center bg-purpura-700 text-purpura-100"
      style={{ width: tamanho, height: tamanho, borderRadius: tamanho * 0.28 }}
    >
      <span className="font-fenicio leading-none" style={{ fontSize: tamanho * 0.62 }}>
        𐤀
      </span>
    </span>
  );
}

export function Logo({ tamanho = 32 }: { tamanho?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Selo tamanho={tamanho} />
      <span className="font-titulo font-semibold tracking-tight" style={{ fontSize: tamanho * 0.7 }}>
        fenícia
      </span>
    </span>
  );
}

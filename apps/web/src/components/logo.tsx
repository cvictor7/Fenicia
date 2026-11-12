/** Logo da Fenícia: a letra alef (𐤀), avó do nosso "A", num selo + o nome. */
export function Selo({ tamanho = 32, claro = false }: { tamanho?: number; claro?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center ${claro ? "bg-sobre-purpura text-purpura-700" : "bg-purpura-700 text-sobre-purpura"}`}
      style={{ width: tamanho, height: tamanho, borderRadius: tamanho * 0.3 }}
    >
      <span className="font-fenicio leading-none" style={{ fontSize: tamanho * 0.62 }}>
        𐤀
      </span>
    </span>
  );
}

export function Logo({ tamanho = 32, claro = false }: { tamanho?: number; claro?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Selo tamanho={tamanho} claro={claro} />
      <span className="font-titulo font-bold tracking-tight" style={{ fontSize: tamanho * 0.72 }}>
        fenícia
      </span>
    </span>
  );
}

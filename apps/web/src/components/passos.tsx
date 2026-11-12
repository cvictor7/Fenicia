/**
 * Os 3 passos da Fenícia, numerados com as letras fenícias que viraram A, B e C.
 * É uma sequência de verdade (post → vitrine → pedido), por isso a numeração.
 */
export const PASSOS = [
  { letra: "𐤀", titulo: "O post vira produto", texto: "Suba a foto e a legenda. Nome, tamanhos, cores e preço saem da legenda." },
  { letra: "𐤁", titulo: "A vitrine se monta sozinha", texto: "Um link para a bio, com cara de perfil do Instagram e estoque em dia." },
  { letra: "𐤂", titulo: "O pedido chega pronto", texto: "O cliente escolhe e manda a mensagem no seu WhatsApp, com número e total." },
];

export function ListaPassos({ compacta = false }: { compacta?: boolean }) {
  return (
    <ol className={compacta ? "space-y-3" : "space-y-5"}>
      {PASSOS.map((p) => (
        <li key={p.titulo} className="flex gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-fenicio text-lg text-murex"
          >
            {p.letra}
          </span>
          <div>
            <p className="font-titulo text-[17px] font-bold leading-tight">{p.titulo}</p>
            {compacta ? null : <p className="mt-1 text-[15px] leading-snug text-sobre-purpura-suave">{p.texto}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

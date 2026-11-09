import { formatarCentavos } from "@fenicia/core";

export default function Inicio() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#3A0E2E] p-6 text-[#F3E6EE]">
      <div className="max-w-md text-center">
        <p className="text-sm text-[#D9B8CC]">etapa 0</p>
        <h1 className="mt-2 text-4xl font-semibold">Olá, Fenícia</h1>
        <p className="mt-4 text-[#E8D3DF]">
          O post vira produto. Teste do pacote core:{" "}
          <span className="whitespace-nowrap">{formatarCentavos(8990)}</span>
        </p>
      </div>
    </main>
  );
}

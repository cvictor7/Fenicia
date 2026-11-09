import type { Metadata } from "next";
import { FormularioPost } from "./formulario";

export const metadata: Metadata = { title: "Novo post" };

// a leitura pela IA pode levar alguns segundos
export const maxDuration = 30;

export default function PaginaNovoPost() {
  return (
    <>
      <h1 className="font-titulo text-2xl font-semibold tracking-tight">Novo post</h1>
      <p className="mt-1 text-tinta-suave">
        Suba as fotos e a legenda como faria no Instagram. A Fenícia monta o produto e você só confere.
      </p>
      <div className="mt-5">
        <FormularioPost />
      </div>
    </>
  );
}

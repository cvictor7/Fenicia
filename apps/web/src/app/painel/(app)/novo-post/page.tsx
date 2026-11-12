import type { Metadata } from "next";
import { Topo } from "@/components/topo";
import { FormularioPost } from "./formulario";

export const metadata: Metadata = { title: "Novo post" };

// a leitura pela IA pode levar alguns segundos
export const maxDuration = 30;

export default function PaginaNovoPost() {
  return (
    <>
      <Topo
        titulo="Novo post"
        subtitulo="Suba as fotos e a legenda do Instagram. A Fenícia monta o produto."
      />
      <FormularioPost />
    </>
  );
}

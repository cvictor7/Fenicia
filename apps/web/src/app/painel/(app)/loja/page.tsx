import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/cabecalho-loja";
import { BotaoConfirmar } from "@/components/confirmar";
import { Topo } from "@/components/topo";
import { obterContexto } from "@/lib/contexto";
import { sair } from "../../../entrar/acoes";
import { CopiarLink } from "./copiar-link";

export const metadata: Metadata = { title: "Minha loja" };

function formatarWhatsapp(n: string | null) {
  if (!n) return "Não informado";
  const d = n.replace(/^55/, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

async function DadosLoja() {
  const { loja, usuario } = await obterContexto();
  const linhas = [
    ["WhatsApp dos pedidos", formatarWhatsapp(loja.whatsapp)],
    ["Instagram", loja.instagram ? `@${loja.instagram}` : "Não informado"],
    ["Sua conta", usuario.email],
  ];
  return (
    <>
      <Topo titulo={loja.nome} subtitulo="Sua loja na Fenícia">
        <div className="mt-5 rounded-2xl bg-white/10 p-4">
          <p className="text-sm text-sobre-purpura-suave">Link da vitrine, para a bio do Instagram</p>
          <CopiarLink caminho={`/${loja.slug}`} />
          <a
            href={`/${loja.slug}`}
            target="_blank"
            className="mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-sobre-purpura font-semibold text-purpura-700"
          >
            Ver minha vitrine <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </Topo>

      <dl className="divide-y divide-linha">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo} className="py-3.5">
            <dt className="text-sm text-tinta-suave">{rotulo}</dt>
            <dd className="mt-0.5 truncate text-[15px]">{valor}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-sm text-tinta-suave">Em breve: editar os dados, logo e cor da vitrine.</p>
    </>
  );
}

export default function PaginaLoja() {
  return (
    <>
      <Suspense fallback={<Carregando />}>
        <DadosLoja />
      </Suspense>
      <BotaoConfirmar
        acao={sair}
        titulo="Sair da conta?"
        texto="Você vai precisar do e-mail e da senha para entrar de novo."
        rotuloConfirmar="Sair"
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-linha font-semibold text-erro"
      >
        <LogOut size={18} aria-hidden="true" /> Sair da conta
      </BotaoConfirmar>
    </>
  );
}

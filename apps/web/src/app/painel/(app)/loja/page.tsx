import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoLoja, Carregando } from "@/components/cabecalho-loja";
import { BotaoConfirmar } from "@/components/confirmar";
import { obterContexto } from "@/lib/contexto";
import { sair } from "../../../entrar/acoes";

export const metadata: Metadata = { title: "Minha loja" };

function formatarWhatsapp(n: string | null) {
  if (!n) return "—";
  const d = n.replace(/^55/, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

async function DadosLoja() {
  const { loja, usuario } = await obterContexto();
  const linhas = [
    ["Link da vitrine", `/${loja.slug}`],
    ["WhatsApp", formatarWhatsapp(loja.whatsapp)],
    ["Instagram", loja.instagram ? `@${loja.instagram}` : "—"],
    ["Sua conta", usuario.email],
  ];
  return (
    <>
      <CabecalhoLoja nome={loja.nome} slug={loja.slug} />
      <a
        href={`/${loja.slug}`}
        target="_blank"
        className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-purpura-700 font-medium text-purpura-100"
      >
        Ver minha vitrine <ExternalLink size={16} aria-hidden="true" />
      </a>
      <dl className="mt-6 divide-y divide-linha rounded-2xl border border-linha bg-white">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <dt className="text-sm text-tinta-suave">{rotulo}</dt>
            <dd className="truncate text-right">{valor}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-tinta-suave">Em breve: editar os dados, logo e cor da vitrine.</p>
    </>
  );
}

export default function PaginaLoja() {
  return (
    <>
      <h1 className="mb-5 font-titulo text-2xl font-semibold tracking-tight">Minha loja</h1>
      <Suspense fallback={<Carregando />}>
        <DadosLoja />
      </Suspense>
      <BotaoConfirmar
        acao={sair}
        titulo="Sair da conta?"
        texto="Você vai precisar do e-mail e da senha para entrar de novo."
        rotuloConfirmar="Sair"
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-linha bg-white font-medium text-erro"
      >
        <LogOut size={18} aria-hidden="true" /> Sair da conta
      </BotaoConfirmar>
    </>
  );
}

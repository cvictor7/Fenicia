import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Inicio() {
  return (
    <main className="min-h-dvh bg-purpura-700 text-sobre-purpura">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
        <Logo tamanho={36} claro />
        <h1 className="mt-auto font-titulo text-[52px] font-extrabold leading-[0.95] tracking-tight">
          Você vende.
          <br />
          A Fenícia organiza.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-sobre-purpura-suave">
          Para quem vende pelo Instagram e pelo WhatsApp. Suba o post, a Fenícia monta o produto, cuida do
          estoque e recebe os pedidos.
        </p>
        <Link
          href="/entrar"
          className="mt-8 flex h-13 items-center justify-center rounded-full bg-sobre-purpura py-3.5 text-lg font-semibold text-purpura-700"
        >
          Entrar no painel
        </Link>
        <p className="mt-6 text-sm text-sobre-purpura-suave">
          O nome vem dos fenícios, o povo que levou o comércio pelo Mediterrâneo e espalhou o alfabeto. A letra{" "}
          <span className="font-fenicio">𐤀</span> do logo virou o nosso A.
        </p>
      </div>
    </main>
  );
}

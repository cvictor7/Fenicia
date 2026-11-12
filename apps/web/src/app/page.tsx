import Link from "next/link";
import { Demonstracao } from "@/components/demonstracao";
import { Logo } from "@/components/logo";
import { ListaPassos } from "@/components/passos";

export default function Inicio() {
  return (
    <main className="min-h-dvh bg-purpura-700 text-sobre-purpura">
      <div className="mx-auto max-w-md px-5 pb-12 pt-6">
        <div className="flex items-center justify-between">
          <Logo tamanho={32} claro />
          <Link href="/entrar" className="rounded-full px-3 py-2 text-sm font-semibold text-sobre-purpura-suave hover:text-white">
            Entrar
          </Link>
        </div>

        <h1 className="mt-9 font-titulo text-[46px] font-extrabold leading-[0.95] tracking-tight">
          Você vende.
          <br />
          A Fenícia organiza.
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-sobre-purpura-suave">
          Para quem vende pelo Instagram e pelo WhatsApp e ainda anota tudo no caderninho.
        </p>

        <div className="mt-10">
          <Demonstracao />
        </div>

        <div className="mt-12">
          <ListaPassos />
        </div>

        <div className="mt-10 grid gap-3">
          <Link
            href="/entrar?modo=criar"
            className="flex h-13 items-center justify-center rounded-full bg-sobre-purpura py-3.5 text-lg font-semibold text-purpura-700"
          >
            Criar minha loja
          </Link>
          <Link
            href="/entrar"
            className="flex h-13 items-center justify-center rounded-full border border-white/25 py-3.5 font-semibold"
          >
            Já tenho conta
          </Link>
        </div>

        <p className="mt-10 border-t border-white/15 pt-6 text-sm leading-relaxed text-sobre-purpura-suave">
          O nome vem dos fenícios, o povo que levou o comércio pelo Mediterrâneo e espalhou o alfabeto. A letra{" "}
          <span className="font-fenicio text-murex">𐤀</span> do logo virou o nosso A.
        </p>
      </div>
    </main>
  );
}

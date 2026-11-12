"use client";

import { useActionState, useState } from "react";
import { BotaoPrincipal, Campo } from "@/components/campo";
import { criarConta, entrar, type EstadoAcesso } from "./acoes";

const inicial: EstadoAcesso = {};

export function FormularioAcesso() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");

  return (
    <div>
      <div role="tablist" className="mb-6 grid grid-cols-2 rounded-full bg-purpura-100 p-1 text-sm">
        {(["entrar", "criar"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={modo === m}
            onClick={() => setModo(m)}
            className="h-10 rounded-full font-semibold text-purpura-900 transition aria-selected:bg-purpura-700 aria-selected:text-sobre-purpura"
          >
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>
      {modo === "entrar" ? <FormEntrar /> : <FormCriar />}
    </div>
  );
}

function Aviso({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="rounded-xl bg-[#f8e4e1] px-3.5 py-3 text-sm text-erro">
      {texto}
    </p>
  );
}

function FormEntrar() {
  const [estado, acao, carregando] = useActionState(entrar, inicial);
  return (
    <form action={acao} className="space-y-4" noValidate>
      <Aviso texto={estado.erro} />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        defaultValue={estado.valores?.email}
        erro={estado.campos?.email}
        required
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        erro={estado.campos?.senha}
        required
      />
      <BotaoPrincipal carregando={carregando}>Entrar</BotaoPrincipal>
    </form>
  );
}

function FormCriar() {
  const [estado, acao, carregando] = useActionState(criarConta, inicial);
  return (
    <form action={acao} className="space-y-4" noValidate>
      <Aviso texto={estado.erro} />
      <Campo
        rotulo="Seu nome"
        name="nome"
        autoComplete="name"
        defaultValue={estado.valores?.nome}
        erro={estado.campos?.nome}
        required
      />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        defaultValue={estado.valores?.email}
        erro={estado.campos?.email}
        required
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="new-password"
        dica="Pelo menos 8 caracteres."
        erro={estado.campos?.senha}
        required
      />
      <BotaoPrincipal carregando={carregando}>Criar conta</BotaoPrincipal>
    </form>
  );
}

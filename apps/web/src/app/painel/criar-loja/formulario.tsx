"use client";

import { gerarSlug } from "@fenicia/core";
import { useActionState, useState, useSyncExternalStore } from "react";
import { BotaoPrincipal, Campo } from "@/components/campo";
import { criarLoja, type EstadoCriarLoja } from "./acoes";

export function FormularioLoja() {
  const [estado, acao, carregando] = useActionState(criarLoja, {} as EstadoCriarLoja);
  const [nome, setNome] = useState(estado.valores?.nome ?? "");
  const [slug, setSlug] = useState(estado.valores?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(Boolean(estado.valores?.slug));
  // endereço do site no navegador (no servidor mostra um texto padrão)
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "fenicia.app",
  );

  return (
    <form action={acao} className="space-y-4" noValidate>
      {estado.erro ? (
        <p role="alert" className="rounded-xl bg-[#f8e4e1] px-3.5 py-3 text-sm text-erro">
          {estado.erro}
        </p>
      ) : null}
      <Campo
        rotulo="Nome da loja"
        name="nome"
        value={nome}
        onChange={(e) => {
          setNome(e.target.value);
          if (!slugEditado) setSlug(gerarSlug(e.target.value));
        }}
        placeholder="Maré Ateliê"
        erro={estado.campos?.nome}
        required
      />
      <Campo
        rotulo="Link da vitrine"
        name="slug"
        value={slug}
        onChange={(e) => {
          setSlugEditado(true);
          setSlug(e.target.value.toLowerCase());
        }}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        dica={`${host}/${slug || "sua-loja"} · é o link que vai na bio`}
        erro={estado.campos?.slug}
        required
      />
      <Campo
        rotulo="WhatsApp da loja"
        name="whatsapp"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        defaultValue={estado.valores?.whatsapp}
        placeholder="(92) 98416-3597"
        dica="Os pedidos da vitrine chegam aqui."
        erro={estado.campos?.whatsapp}
        required
      />
      <Campo
        rotulo="Instagram (opcional)"
        name="instagram"
        defaultValue={estado.valores?.instagram}
        autoCapitalize="none"
        autoCorrect="off"
        placeholder="@mare.atelie"
        erro={estado.campos?.instagram}
      />
      <BotaoPrincipal carregando={carregando}>Criar minha loja</BotaoPrincipal>
    </form>
  );
}

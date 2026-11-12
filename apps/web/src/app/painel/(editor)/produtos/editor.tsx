"use client";

import {
  LIMITE_OPCOES,
  chaveAtributos,
  combinarOpcoes,
  converterPrecoDigitado,
  formatarCentavos,
  nomeVariacao,
} from "@fenicia/core";
import { Plus, Trash2, X } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { BotaoConfirmar } from "@/components/confirmar";
import { AcaoTopo, Topo } from "@/components/topo";
import { SeletorFotos, type Foto } from "@/components/seletor-fotos";
import { arquivarProdutoAcao, salvarProdutoAcao, type DadosEditor, type EstadoEditor } from "./acoes";

type OpcaoEditor = { nome: string; valores: string[]; rascunho: string };

type Props = {
  id: string | null;
  categorias: { id: string; nome: string }[];
  inicial: DadosEditor;
  publicado?: boolean;
  /** quando o produto nasce de um post ("o post vira produto") */
  postId?: string | null;
  /** conteúdo extra acima do formulário (ex.: o que a IA leu) */
  topo?: React.ReactNode;
};

const SUGESTOES = ["Tamanho", "Cor", "Sabor", "Modelo", "Voltagem"];

const EXEMPLOS: Record<string, string> = {
  tamanho: "P, M, G",
  cor: "Preto, Branco",
  sabor: "Ninho, Morango",
  modelo: "Básico, Premium",
  voltagem: "110V, 220V",
};

function exemploDe(nome: string) {
  return EXEMPLOS[nome.trim().toLowerCase()] ?? "Separe por vírgula";
}

const estiloCampo =
  "block h-12 w-full rounded-xl border border-linha bg-white px-3.5 text-base outline-none transition focus:border-purpura-700 focus:ring-2 focus:ring-purpura-100 aria-invalid:border-erro";

/**
 * Editor de produto. O estado fica todo aqui no navegador e vai para o servidor como JSON;
 * o servidor valida tudo de novo antes de gravar.
 */
export function EditorProduto({ id, categorias, inicial, publicado, postId = null, topo }: Props) {
  const acaoSalvar = salvarProdutoAcao.bind(null, id, postId);
  const [estado, acao, salvando] = useActionState(acaoSalvar, {} as EstadoEditor);

  const [nome, setNome] = useState(inicial.nome);
  const [descricao, setDescricao] = useState(inicial.descricao);
  const [categoriaId, setCategoriaId] = useState(inicial.categoriaId);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [preco, setPreco] = useState(inicial.preco);
  const [temVariacoes, setTemVariacoes] = useState(inicial.temVariacoes);
  const [opcoes, setOpcoes] = useState<OpcaoEditor[]>(
    inicial.opcoes.map((o) => ({ ...o, rascunho: "" })),
  );
  const [linhas, setLinhas] = useState(inicial.linhas);
  const [fotos, setFotos] = useState<Foto[]>(inicial.fotos);

  const combinacoes = useMemo(
    () => combinarOpcoes(temVariacoes ? opcoes : []),
    [opcoes, temVariacoes],
  );

  const precoBase = converterPrecoDigitado(preco);
  const erroPrecoLocal = precoBase === undefined ? "Digite o preço assim: 89,90" : undefined;

  const dados: DadosEditor = {
    nome,
    descricao,
    categoriaId,
    novaCategoria,
    preco,
    temVariacoes,
    opcoes: opcoes.map(({ nome, valores }) => ({ nome, valores })),
    linhas,
    fotos,
  };

  function mudarOpcao(i: number, mudanca: Partial<OpcaoEditor>) {
    setOpcoes((atual) => atual.map((o, j) => (j === i ? { ...o, ...mudanca } : o)));
  }

  function adicionarValor(i: number) {
    const o = opcoes[i];
    const novos = o.rascunho
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v && !o.valores.some((x) => x.toLowerCase() === v.toLowerCase()));
    mudarOpcao(i, { valores: [...o.valores, ...novos], rascunho: "" });
  }

  function mudarLinha(chave: string, campo: "estoque" | "preco", valor: string) {
    setLinhas((atual) => ({
      ...atual,
      [chave]: { ...(atual[chave] ?? { estoque: "", preco: "" }), [campo]: valor },
    }));
  }

  return (
    <form action={acao} noValidate>
      <input type="hidden" name="dados" value={JSON.stringify(dados)} />

      <Topo
        titulo={id ? nome || "Editar produto" : postId ? "Confira o produto" : "Novo produto"}
        subtitulo={id ? (publicado ? "Na vitrine" : "Rascunho, fora da vitrine") : postId ? "Lido do seu post. Ajuste o que precisar." : undefined}
        voltar={postId ? "/painel/novo-post" : "/painel/produtos"}
        acao={id ? <AcaoTopo href={`/painel/produtos/${id}/estoque`}>Estoque</AcaoTopo> : undefined}
      />

      {estado.erro ? (
        <p role="alert" className="mb-4 rounded-xl bg-[#f8e4e1] px-3.5 py-3 text-sm text-erro">{estado.erro}</p>
      ) : null}

      {topo}

      <section className="mt-5">
        <h2 className="mb-2 font-titulo text-lg font-bold">Fotos</h2>
        <SeletorFotos fotos={fotos} aoMudar={setFotos} />
      </section>

      <section className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nome</span>
          <input
            className={estiloCampo}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Vestido midi de linho"
            aria-invalid={estado.campos?.nome ? true : undefined}
          />
          {estado.campos?.nome ? <span className="mt-1.5 block text-sm text-erro">{estado.campos.nome}</span> : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Preço</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-suave">R$</span>
            <input
              className={`${estiloCampo} pl-10`}
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              inputMode="decimal"
              placeholder="89,90"
              aria-invalid={erroPrecoLocal || estado.campos?.preco ? true : undefined}
            />
          </div>
          {erroPrecoLocal || estado.campos?.preco ? (
            <span className="mt-1.5 block text-sm text-erro">{erroPrecoLocal ?? estado.campos?.preco}</span>
          ) : (
            <span className="mt-1.5 block text-sm text-tinta-suave">Pode deixar vazio no rascunho. Para publicar, é obrigatório.</span>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Categoria</span>
          <select className={estiloCampo} value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
            <option value="nova">+ Nova categoria</option>
          </select>
        </label>
        {categoriaId === "nova" ? (
          <input
            className={estiloCampo}
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            placeholder="Nome da categoria, ex.: Vestidos"
            aria-label="Nome da nova categoria"
          />
        ) : null}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Descrição (opcional)</span>
          <textarea
            className="block min-h-24 w-full rounded-xl border border-linha bg-white px-3.5 py-3 text-base outline-none focus:border-purpura-700 focus:ring-2 focus:ring-purpura-100"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Tecido, medidas, como usar..."
          />
        </label>
      </section>

      <section className="mt-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-titulo text-lg font-bold">Variações</h2>
            <p className="text-sm text-tinta-suave">Tamanho, cor, sabor...</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={temVariacoes}
            aria-label="Este produto tem variações"
            onClick={() => {
              setTemVariacoes(!temVariacoes);
              if (!temVariacoes && opcoes.length === 0) setOpcoes([{ nome: "Tamanho", valores: [], rascunho: "" }]);
            }}
            className="relative h-7 w-12 shrink-0 rounded-full bg-linha transition aria-checked:bg-purpura-700"
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${temVariacoes ? "left-6" : "left-1"}`} />
          </button>
        </div>

        {temVariacoes ? (
          <div className="mt-4 space-y-3">
            {opcoes.map((o, i) => (
              <div key={i} className="rounded-[var(--radius-balao)] bg-white p-3.5">
                <div className="flex items-center gap-2">
                  <input
                    value={o.nome}
                    onChange={(e) => mudarOpcao(i, { nome: e.target.value })}
                    placeholder="Nome (ex.: Tamanho)"
                    aria-label="Nome da variação"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-linha px-3 text-base font-medium outline-none focus:border-purpura-700"
                  />
                  <button
                    type="button"
                    onClick={() => setOpcoes(opcoes.filter((_, j) => j !== i))}
                    aria-label={`Remover ${o.nome || "variação"}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-tinta-suave hover:bg-purpura-100"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>

                {o.valores.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {o.valores.map((v) => (
                      <li key={v} className="flex items-center gap-1 rounded-lg bg-purpura-100 py-1 pl-2.5 pr-1 text-sm text-purpura-900">
                        {v}
                        <button
                          type="button"
                          aria-label={`Tirar ${v}`}
                          onClick={() => mudarOpcao(i, { valores: o.valores.filter((x) => x !== v) })}
                          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-purpura-500/20"
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-3 flex gap-2">
                  <input
                    value={o.rascunho}
                    onChange={(e) => mudarOpcao(i, { rascunho: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        adicionarValor(i);
                      }
                    }}
                    placeholder={exemploDe(o.nome)}
                    aria-label={`Opções de ${o.nome || "variação"}`}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-linha px-3 text-base outline-none focus:border-purpura-700"
                  />
                  <button
                    type="button"
                    onClick={() => adicionarValor(i)}
                    className="h-10 shrink-0 rounded-lg border border-linha px-3 text-sm font-medium"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}

            {opcoes.length < LIMITE_OPCOES ? (
              <div className="flex flex-wrap gap-2">
                {SUGESTOES.filter((s) => !opcoes.some((o) => o.nome.toLowerCase() === s.toLowerCase()))
                  .slice(0, 3)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setOpcoes([...opcoes, { nome: s, valores: [], rascunho: "" }])}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-dashed border-purpura-500 px-3 text-sm text-purpura-700"
                    >
                      <Plus size={14} aria-hidden="true" /> {s}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => setOpcoes([...opcoes, { nome: "", valores: [], rascunho: "" }])}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-dashed border-linha px-3 text-sm text-tinta-suave"
                >
                  <Plus size={14} aria-hidden="true" /> Outra
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {estado.campos?.variacoes ? (
          <p role="alert" className="mt-3 text-sm text-erro">{estado.campos.variacoes}</p>
        ) : null}
      </section>

      <section className="mt-7">
        <h2 className="font-titulo text-lg font-bold">Estoque</h2>
        <p className="text-sm text-tinta-suave">
          Vazio = não informado. Preço diferente só se essa opção custar outro valor.
        </p>
        <ul className="mt-3 divide-y divide-linha rounded-[var(--radius-balao)] bg-white">
          {combinacoes.map((atributos) => {
            const chave = chaveAtributos(atributos);
            const linha = linhas[chave] ?? { estoque: "", preco: "" };
            const rotulo = nomeVariacao(atributos, opcoes.map((o) => o.nome.trim()));
            return (
              <li key={chave} className="flex items-center gap-2 px-3.5 py-2.5">
                <span className="min-w-0 flex-1 truncate font-medium">{rotulo}</span>
                <input
                  value={linha.estoque}
                  onChange={(e) => mudarLinha(chave, "estoque", e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="Qtd."
                  aria-label={`Estoque de ${rotulo}`}
                  className="h-10 w-16 rounded-lg border border-linha px-2 text-center text-base outline-none focus:border-purpura-700"
                />
                {temVariacoes ? (
                  <input
                    value={linha.preco}
                    onChange={(e) => mudarLinha(chave, "preco", e.target.value)}
                    inputMode="decimal"
                    placeholder={precoBase ? formatarCentavos(precoBase).replace("R$ ", "") : "Preço"}
                    aria-label={`Preço de ${rotulo}`}
                    className="h-10 w-24 rounded-lg border border-linha px-2 text-center text-base outline-none placeholder:text-tinta-suave/60 focus:border-purpura-700"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {id ? (
        <BotaoConfirmar
          acao={arquivarProdutoAcao.bind(null, id)}
          titulo="Arquivar produto?"
          texto="Ele sai da vitrine e da lista principal. Dá para ver depois no filtro Arquivados."
          rotuloConfirmar="Arquivar"
          perigo
          className="mt-8 h-11 w-full rounded-full text-sm font-semibold text-erro hover:bg-[#f8e4e1]"
        >
          Arquivar produto
        </BotaoConfirmar>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2 px-4 py-3">
          <button
            type="submit"
            name="intencao"
            value="rascunho"
            disabled={salvando}
            className="h-12 rounded-full border border-purpura-200 font-semibold disabled:opacity-70"
          >
            {publicado ? "Tirar da vitrine" : "Salvar rascunho"}
          </button>
          <button
            type="submit"
            name="intencao"
            value="publicar"
            disabled={salvando}
            className="h-12 rounded-full bg-purpura-700 font-semibold text-sobre-purpura disabled:opacity-70"
          >
            {salvando ? "Salvando…" : publicado ? "Salvar" : postId ? "Aprovar e publicar" : "Publicar"}
          </button>
        </div>
      </div>
    </form>
  );
}

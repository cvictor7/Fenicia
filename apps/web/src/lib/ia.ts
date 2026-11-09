import { conferirSugestao, leituraSimples, type SugestaoConferida } from "@fenicia/core";

/**
 * Lê o post (fotos + legenda) e sugere o produto.
 * 1) Tenta o Gemini (grátis, com resposta em JSON num formato fixo).
 * 2) Se não tiver chave, falhar ou estourar a cota, usa a leitura simples (regras na legenda).
 * Nos dois casos a sugestão passa por conferirSugestao: preço fora da legenda é descartado.
 */

export type Leitura = { sugestao: SugestaoConferida; modelo: string; erro: string | null };

const MODELOS = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-2.5-flash"].filter(
  (m): m is string => Boolean(m),
);

const INSTRUCOES = `Você ajuda pequenos lojistas brasileiros que vendem pelo Instagram.
Recebe as fotos e a legenda de um post e devolve os dados do produto em JSON.
Regras obrigatórias:
- precoCentavos: só se o preço estiver ESCRITO na legenda. Converta para centavos (R$ 89,90 = 8990). Se não houver preço escrito, use null. Nunca estime pelo tipo de produto.
- Não invente estoque nem quantidade.
- opcoes: só variações citadas na legenda (ex.: Tamanho P, M, G; Cor Preto, Areia; Sabor Ninho, Morango). Se a legenda não cita, devolva lista vazia.
- nome: curto e claro, como numa loja (ex.: "Vestido midi de linho"), sem emoji e sem hashtag.
- categoria: uma palavra ou duas (ex.: "Vestidos", "Doces", "Fones"), pode usar a foto.
- descricao: 1 ou 2 frases em português, usando o que a legenda e a foto mostram, sem exagero e sem emoji.`;

const ESQUEMA = {
  type: "OBJECT",
  properties: {
    nome: { type: "STRING", nullable: true },
    categoria: { type: "STRING", nullable: true },
    descricao: { type: "STRING", nullable: true },
    precoCentavos: { type: "INTEGER", nullable: true },
    opcoes: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          nome: { type: "STRING" },
          valores: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["nome", "valores"],
      },
    },
  },
  required: ["nome", "categoria", "descricao", "precoCentavos", "opcoes"],
};

async function fotoEmBase64(url: string) {
  if (url.startsWith("data:")) {
    const [cabecalho, dados] = url.split(",");
    return { mimeType: cabecalho.slice(5).split(";")[0], data: dados };
  }
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`foto ${resposta.status}`);
  const mimeType = resposta.headers.get("content-type") ?? "image/webp";
  return { mimeType, data: Buffer.from(await resposta.arrayBuffer()).toString("base64") };
}

async function chamarGemini(modelo: string, chave: string, legenda: string, fotos: string[]) {
  const imagens = await Promise.all(fotos.slice(0, 3).map(fotoEmBase64));
  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": chave },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: INSTRUCOES }] },
        contents: [
          {
            role: "user",
            parts: [
              ...imagens.map((inlineData) => ({ inlineData })),
              { text: `Legenda do post:\n"""${legenda}"""` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: ESQUEMA,
        },
      }),
      signal: AbortSignal.timeout(25_000),
    },
  );
  if (!resposta.ok) {
    const corpo = await resposta.text();
    throw Object.assign(new Error(`Gemini ${resposta.status}: ${corpo.slice(0, 200)}`), { status: resposta.status });
  }
  const json = await resposta.json();
  const texto = json?.candidates?.[0]?.content?.parts?.find((p: { text?: string }) => p.text)?.text;
  if (!texto) throw new Error("Gemini respondeu vazio.");
  return JSON.parse(texto);
}

export async function lerPost(legenda: string, fotos: string[]): Promise<Leitura> {
  const chave = process.env.GEMINI_API_KEY;
  let erro: string | null = null;

  if (chave) {
    for (const modelo of MODELOS) {
      try {
        const bruta = await chamarGemini(modelo, chave, legenda, fotos);
        return { sugestao: conferirSugestao(bruta, legenda), modelo, erro: null };
      } catch (e) {
        erro = e instanceof Error ? e.message : String(e);
        // modelo não existe mais: tenta o próximo; qualquer outro erro vai para a leitura simples
        if ((e as { status?: number }).status !== 404) break;
      }
    }
    console.error("[ia] Gemini falhou, usando leitura simples:", erro);
  }

  return {
    sugestao: conferirSugestao(leituraSimples(legenda), legenda),
    modelo: "leitura-simples",
    erro,
  };
}

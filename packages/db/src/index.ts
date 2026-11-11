export * from "./schema";
export { criarBanco, obterBanco } from "./cliente";
export { daLoja } from "./escopo";
export { plantarSemente, SLUG_LOJA_DEMO } from "./semente";
export { criarLojaComDono, lojasDoUsuario, slugDisponivel } from "./usuarios";
export type { Banco } from "./tipos";
export {
  ErroProduto,
  arquivarProduto,
  buscarProdutoCompleto,
  historicoEstoque,
  listarProdutosResumo,
  obterOuCriarCategoria,
  resumoProdutos,
  salvarProduto,
  type DadosProduto,
  type FiltroProdutos,
} from "./produtos";
export { buscarPost, criarPost, registrarLeitura } from "./posts";
export { movimentarEstoque } from "./estoque";
export { lojaPorSlug, produtoDaVitrine, produtosDaVitrine } from "./vitrine";
export {
  ErroPedido,
  contarPedidosNovos,
  criarPedido,
  listarPedidos,
  mudarStatusPedido,
  type ItemPedidoEntrada,
} from "./pedidos";

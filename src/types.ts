export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco_venda: number;
  estoque_minimo: number;
  criado_em: string;
}

export interface LoteEstoque {
  id: string;
  produto_id: string;
  quantidade: number;
  custo_unitario: number;
  data_entrada: string;
}

export interface Venda {
  id: string;
  produto_id: string;
  quantidade: number;
  preco_venda: number;
  data_venda: string;
}

export interface AnaliseProduto {
  id: string;
  produto: string;
  categoria: string;
  precoVenda: number;
  custoMedioPonderado: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  valorEstoque: number;
  totalVendido: number;
  receitaTotal: number;
  elasticidade: number | null;
  scoreManter: number;
  recomendacao: "Manter" | "Avaliar" | "Descartar";
  justificativa: string;
}

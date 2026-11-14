import type { AnaliseProduto, LoteEstoque, Produto, Venda } from "./types";

export function calcularMediaPonderada(lotes: LoteEstoque[]): number {
  const totalQtde = lotes.reduce((sum, l) => sum + l.quantidade, 0);
  if (totalQtde === 0) return 0;
  const totalValor = lotes.reduce((sum, l) => sum + l.quantidade * l.custo_unitario, 0);
  return totalValor / totalQtde;
}

export function calcularEstoqueTotal(lotes: LoteEstoque[]): number {
  return lotes.reduce((sum, l) => sum + l.quantidade, 0);
}

export function calcularValorEstoque(lotes: LoteEstoque[]): number {
  return lotes.reduce((sum, l) => sum + l.quantidade * l.custo_unitario, 0);
}

export function calcularElasticidade(vendas: Venda[]): number | null {
  if (vendas.length === 0) return null;
  const map = new Map<number, number>();
  for (const v of vendas) {
    const key = v.preco_venda;
    map.set(key, (map.get(key) ?? 0) + v.quantidade);
  }
  const sorted = Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  if (sorted.length < 2) return null;
  const [p1, q1] = sorted[0];
  const [p2, q2] = sorted[sorted.length - 1];
  if (p1 === 0 || q1 === 0) return null;
  const varPreco = (p2 - p1) / p1;
  const varQtde = (q2 - q1) / q1;
  if (varPreco === 0) return null;
  return varQtde / varPreco;
}

export function calcularScoreManter(
  custoMedio: number,
  precoVenda: number,
  estoque: number,
  estoqueMinimo: number,
  elasticidade: number | null,
  totalVendido: number
): { score: number; justificativa: string } {
  const razoes: string[] = [];
  let score = 0;

  // 1. Margem de lucro (0-30)
  const margemPct = custoMedio > 0 ? (precoVenda - custoMedio) / custoMedio : 0;
  if (margemPct <= 0) {
    razoes.push("Produto com prejuízo (preço abaixo do custo)");
  } else if (margemPct >= 1.0) {
    score += 30;
    razoes.push("Margem excelente (acima de 100%)");
  } else {
    score += Math.round(margemPct * 30);
    razoes.push(`Margem de ${(margemPct * 100).toFixed(0)}%`);
  }

  // 2. Giro de estoque (0-30)
  const giro = estoque > 0 ? totalVendido / estoque : 0;
  if (giro >= 2.0) {
    score += 30;
    razoes.push("Giro de estoque alto");
  } else if (giro >= 1.0) {
    score += 20;
    razoes.push("Giro de estoque bom");
  } else if (giro > 0) {
    score += 10;
    razoes.push("Giro de estoque baixo");
  } else {
    razoes.push("Sem vendas registradas");
  }

  // 3. Elasticidade (0-25)
  if (elasticidade === null) {
    score += 12;
    razoes.push("Elasticidade indisponível (dados insuficientes)");
  } else {
    const absEl = Math.abs(elasticidade);
    if (absEl > 1) {
      score += 10;
      razoes.push(`Produto elástico (|E|=${absEl.toFixed(1)}) — sensível a preço`);
    } else if (absEl < 1) {
      score += 25;
      razoes.push(`Produto inelástico (|E|=${absEl.toFixed(1)}) — demanda estável`);
    } else {
      score += 18;
      razoes.push(`Elasticidade unitária (|E|=${absEl.toFixed(1)})`);
    }
  }

  // 4. Cobertura de estoque (0-15)
  if (estoque >= estoqueMinimo && estoqueMinimo > 0) {
    score += 15;
    razoes.push("Estoque acima do mínimo");
  } else if (estoque < estoqueMinimo) {
    score += 5;
    razoes.push("Estoque abaixo do mínimo");
  } else {
    score += 10;
    razoes.push("Sem definição de estoque mínimo");
  }

  return { score, justificativa: razoes.join(" | ") };
}

export function classificarScore(score: number): "Manter" | "Avaliar" | "Descartar" {
  if (score >= 70) return "Manter";
  if (score >= 45) return "Avaliar";
  return "Descartar";
}

export function buildAnalise(
  produtos: Produto[],
  lotes: LoteEstoque[],
  vendas: Venda[]
): AnaliseProduto[] {
  return produtos.map((prod) => {
    const lotesProd = lotes.filter((l) => l.produto_id === prod.id);
    const vendasProd = vendas.filter((v) => v.produto_id === prod.id);

    const custoMedio = calcularMediaPonderada(lotesProd);
    const estoque = calcularEstoqueTotal(lotesProd);
    const valorEstoque = calcularValorEstoque(lotesProd);
    const elasticidade = calcularElasticidade(vendasProd);
    const totalVendido = vendasProd.reduce((s, v) => s + v.quantidade, 0);
    const receita = vendasProd.reduce((s, v) => s + v.quantidade * v.preco_venda, 0);

    const { score, justificativa } = calcularScoreManter(
      custoMedio,
      prod.preco_venda,
      estoque,
      prod.estoque_minimo,
      elasticidade,
      totalVendido
    );

    return {
      id: prod.id,
      produto: prod.nome,
      categoria: prod.categoria,
      precoVenda: prod.preco_venda,
      custoMedioPonderado: Math.round(custoMedio * 100) / 100,
      estoqueAtual: estoque,
      estoqueMinimo: prod.estoque_minimo,
      valorEstoque: Math.round(valorEstoque * 100) / 100,
      totalVendido,
      receitaTotal: Math.round(receita * 100) / 100,
      elasticidade: elasticidade !== null ? Math.round(elasticidade * 100) / 100 : null,
      scoreManter: score,
      recomendacao: classificarScore(score),
      justificativa,
    };
  });
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

import { useMemo, useState } from "react";
import type { AnaliseProduto, LoteEstoque, Venda } from "../types";
import { formatBRL, formatDate } from "../calculations";
import { KpiCard } from "../components/KpiCard";
import { RecomendacaoBadge } from "../components/RecomendacaoBadge";
import { Boxes, DollarSign, Package, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";

interface AnalysisProps {
  analise: AnaliseProduto[];
  lotes: LoteEstoque[];
  vendas: Venda[];
}

interface ScatterPoint {
  preco: number;
  quantidade: number;
}

function linearRegression(points: ScatterPoint[]): ScatterPoint[] {
  if (points.length < 2) return [];
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.preco, 0);
  const sumY = points.reduce((s, p) => s + p.quantidade, 0);
  const sumXY = points.reduce((s, p) => s + p.preco * p.quantidade, 0);
  const sumX2 = points.reduce((s, p) => s + p.preco * p.preco, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const minP = Math.min(...points.map((p) => p.preco));
  const maxP = Math.max(...points.map((p) => p.preco));
  return [
    { preco: minP, quantidade: Math.round(slope * minP + intercept) },
    { preco: maxP, quantidade: Math.round(slope * maxP + intercept) },
  ];
}

const recBg: Record<string, string> = {
  Manter: "bg-green-600",
  Avaliar: "bg-amber-500",
  Descartar: "bg-red-600",
};

export function Analysis({ analise, lotes, vendas }: AnalysisProps) {
  const [selected, setSelected] = useState(analise[0]?.produto ?? "");
  const currentName = analise.find((a) => a.produto === selected)?.produto ?? analise[0]?.produto;
  const row = useMemo(
    () => analise.find((a) => a.produto === (currentName ?? selected)) ?? analise[0],
    [analise, selected, currentName]
  );

  if (!row) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Análise Detalhada por Produto</h2>
        <p className="text-slate-500">Cadastre produtos para ver a análise.</p>
      </div>
    );
  }

  const lotesProd = lotes.filter((l) => l.produto_id === row.id);
  const vendasProd = vendas.filter((v) => v.produto_id === row.id);

  // aggregate vendas by preco for scatter chart
  const precoMap = new Map<number, number>();
  for (const v of vendasProd) {
    precoMap.set(v.preco_venda, (precoMap.get(v.preco_venda) ?? 0) + v.quantidade);
  }
  const scatterData = Array.from(precoMap.entries())
    .map(([preco, quantidade]) => ({ preco, quantidade }))
    .sort((a, b) => a.preco - b.preco);
  const trendData = linearRegression(scatterData);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Análise Detalhada por Produto</h2>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Selecione um produto</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          {analise.map((a) => (
            <option key={a.id} value={a.produto}>
              {a.produto}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Custo Médio Ponderado"
          value={formatBRL(row.custoMedioPonderado)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard label="Preço de Venda" value={formatBRL(row.precoVenda)} icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Estoque Atual" value={`${row.estoqueAtual} un.`} icon={<Boxes className="h-4 w-4" />} />
        <KpiCard
          label="Valor em Estoque"
          value={formatBRL(row.valorEstoque)}
          icon={<Package className="h-4 w-4" />}
          accent="success"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Vendido" value={`${row.totalVendido} un.`} icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard label="Receita Total" value={formatBRL(row.receitaTotal)} icon={<DollarSign className="h-4 w-4" />} accent="success" />
        <KpiCard
          label="Elasticidade Preço"
          value={row.elasticidade !== null ? row.elasticidade.toFixed(2) : "N/D"}
        />
        <KpiCard label="Score Manter" value={`${row.scoreManter}/100`} />
      </div>

      <div className={`rounded-xl px-5 py-4 text-center text-lg font-semibold text-white shadow-sm ${recBg[row.recomendacao]}`}>
        Recomendação: {row.recomendacao}
      </div>
      <p className="-mt-3 text-sm text-slate-500">{row.justificativa}</p>

      {/* Lotes */}
      {lotesProd.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-700">Lotes de Estoque (Média Ponderada)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Data</th>
                  <th className="px-4 py-2 text-right font-medium">Quantidade</th>
                  <th className="px-4 py-2 text-right font-medium">Custo Unit.</th>
                  <th className="px-4 py-2 text-right font-medium">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {lotesProd.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50">
                    <td className="px-4 py-2 text-slate-600">{formatDate(l.data_entrada)}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{l.quantidade}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{formatBRL(l.custo_unitario)}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{formatBRL(l.quantidade * l.custo_unitario)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-semibold text-slate-700">
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2 text-right">{lotesProd.reduce((s, l) => s + l.quantidade, 0)}</td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-right">{formatBRL(lotesProd.reduce((s, l) => s + l.quantidade * l.custo_unitario, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Custo médio ponderado = ({formatBRL(lotesProd.reduce((s, l) => s + l.quantidade * l.custo_unitario, 0))}) / (
            {lotesProd.reduce((s, l) => s + l.quantidade, 0)}) = {formatBRL(row.custoMedioPonderado)}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          Sem lotes cadastrados para este produto.
        </div>
      )}

      {/* Vendas */}
      {vendasProd.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-slate-700">Histórico de Vendas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-4 py-2 font-medium">Data</th>
                    <th className="px-4 py-2 text-right font-medium">Quantidade</th>
                    <th className="px-4 py-2 text-right font-medium">Preço Venda</th>
                    <th className="px-4 py-2 text-right font-medium">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasProd.map((v) => (
                    <tr key={v.id} className="border-b border-slate-50">
                      <td className="px-4 py-2 text-slate-600">{formatDate(v.data_venda)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{v.quantidade}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatBRL(v.preco_venda)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatBRL(v.quantidade * v.preco_venda)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {scatterData.length >= 2 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-700">Curva Preço x Demanda (Elasticidade)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={scatterData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="preco"
                    type="number"
                    name="Preço"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(v: number) => `R$${v.toFixed(0)}`}
                    label={{ value: "Preço de Venda (R$)", position: "insideBottom", offset: -5, fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    dataKey="quantidade"
                    type="number"
                    name="Quantidade"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{ value: "Quantidade Vendida", angle: -90, position: "insideLeft", fontSize: 12, fill: "#64748b" }}
                  />
                  <Tooltip
                    formatter={(v: number, name: string) =>
                      name === "preco" ? formatBRL(v) : String(v)
                    }
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Scatter dataKey="quantidade" name="Vendas" fill="#3b82f6" />
                  <Line
                    data={trendData}
                    dataKey="quantidade"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="Tendência"
                    type="monotone"
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
          Sem vendas registradas para este produto.
        </div>
      )}

      <div className="hidden">
        <RecomendacaoBadge recomendacao={row.recomendacao} />
      </div>
    </div>
  );
}

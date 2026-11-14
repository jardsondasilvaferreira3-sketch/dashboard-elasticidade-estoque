import type { AnaliseProduto } from "../types";
import { formatBRL, formatDate } from "../calculations";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KpiCard } from "../components/KpiCard";
import { RecomendacaoBadge } from "../components/RecomendacaoBadge";
import { Boxes, DollarSign, Package, TrendingUp } from "lucide-react";

interface OverviewProps {
  analise: AnaliseProduto[];
}

const recCores: Record<string, string> = {
  Manter: "#22c55e",
  Avaliar: "#f59e0b",
  Descartar: "#ef4444",
};

export function Overview({ analise }: OverviewProps) {
  const valorTotal = analise.reduce((s, a) => s + a.valorEstoque, 0);
  const receitaTotal = analise.reduce((s, a) => s + a.receitaTotal, 0);
  const unidadesTotal = analise.reduce((s, a) => s + a.estoqueAtual, 0);

  const sortedByValor = [...analise].sort((a, b) => b.valorEstoque - a.valorEstoque).slice(0, 15);

  const recCounts = analise.reduce((acc, a) => {
    acc[a.recomendacao] = (acc[a.recomendacao] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(recCounts).map(([name, value]) => ({ name, value }));

  const sortedByScore = [...analise].sort((a, b) => b.scoreManter - a.scoreManter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <p className="mt-1 text-slate-500">
          Análise de valor de estoque por média ponderada, elasticidade de preço e score de manutenção.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Produtos Cadastrados" value={String(analise.length)} icon={<Package className="h-4 w-4" />} />
        <KpiCard
          label="Valor Total Estoque"
          value={formatBRL(valorTotal)}
          icon={<DollarSign className="h-4 w-4" />}
          accent="success"
        />
        <KpiCard
          label="Receita Total"
          value={formatBRL(receitaTotal)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="warning"
        />
        <KpiCard
          label="Unidades em Estoque"
          value={unidadesTotal.toLocaleString("pt-BR")}
          icon={<Boxes className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-700">Valor de Estoque por Produto</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sortedByValor} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="produto"
                angle={-35}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                formatter={(v: number) => formatBRL(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="valorEstoque" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-700">Recomendação de Manutenção</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={recCores[entry.name] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-20 text-center text-slate-400">Sem dados</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-700">
          Resumo de Todos os Produtos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 font-medium">Categoria</th>
                <th className="px-5 py-3 text-right font-medium">Preço Venda</th>
                <th className="px-5 py-3 text-right font-medium">Custo Médio Pond.</th>
                <th className="px-5 py-3 text-right font-medium">Estoque</th>
                <th className="px-5 py-3 text-right font-medium">Valor Estoque</th>
                <th className="px-5 py-3 text-right font-medium">Elasticidade</th>
                <th className="px-5 py-3 text-center font-medium">Score</th>
                <th className="px-5 py-3 text-center font-medium">Recomendação</th>
              </tr>
            </thead>
            <tbody>
              {sortedByScore.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-700">{a.produto}</td>
                  <td className="px-5 py-3 text-slate-500">{a.categoria}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatBRL(a.precoVenda)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatBRL(a.custoMedioPonderado)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{a.estoqueAtual}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatBRL(a.valorEstoque)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">
                    {a.elasticidade !== null ? a.elasticidade.toFixed(2) : "N/D"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="font-bold text-slate-700">{a.scoreManter}</span>
                    <span className="text-slate-400">/100</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <RecomendacaoBadge recomendacao={a.recomendacao} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// silence unused import for formatDate — kept for potential future use
void formatDate;

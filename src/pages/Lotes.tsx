import { useState } from "react";
import type { LoteEstoque, Produto } from "../types";
import { supabase } from "../supabaseClient";
import { formatBRL, formatDate } from "../calculations";
import { Collapsible } from "../components/Collapsible";

interface LotesProps {
  produtos: Produto[];
  lotes: LoteEstoque[];
  refresh: () => void;
}

export function Lotes({ produtos, lotes, refresh }: LotesProps) {
  const [prodNome, setProdNome] = useState("");
  const [qtde, setQtde] = useState(1);
  const [custo, setCusto] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prod = produtos.find((p) => p.nome === prodNome);
    if (!prod) return;
    setSaving(true);
    const { error } = await supabase.from("lotes_estoque").insert({
      produto_id: prod.id,
      quantidade: qtde,
      custo_unitario: custo,
    });
    setSaving(false);
    if (error) {
      setMsg(`Erro: ${error.message}`);
      return;
    }
    setMsg("Entrada registrada!");
    setQtde(1);
    setCusto(0);
    refresh();
  }

  const lotesDisplay = lotes.map((l) => {
    const prod = produtos.find((p) => p.id === l.produto_id);
    return {
      ...l,
      nomeProduto: prod?.nome ?? "—",
      valorTotal: l.quantidade * l.custo_unitario,
    };
  });

  if (produtos.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Lotes de Estoque</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          Cadastre produtos primeiro.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Lotes de Estoque (Entrada de Mercadoria)</h2>
        <p className="mt-1 text-slate-500">
          Cada entrada de estoque registra quantidade e custo unitário. O sistema calcula o custo médio ponderado automaticamente.
        </p>
      </div>

      <Collapsible title="Registrar Entrada de Estoque" defaultOpen>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Produto</label>
            <select
              value={prodNome}
              onChange={(e) => setProdNome(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Selecione...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.nome}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Quantidade</label>
            <input
              type="number"
              min="1"
              step="1"
              value={qtde}
              onChange={(e) => setQtde(parseInt(e.target.value) || 1)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Custo Unitário (R$)</label>
            <input
              type="number"
              min="0"
              step="0.50"
              value={custo}
              onChange={(e) => setCusto(parseFloat(e.target.value) || 0)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={saving || !prodNome}
              className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Registrando..." : "Registrar Entrada"}
            </button>
          </div>
          {msg && <p className="sm:col-span-3 text-sm font-medium text-green-600">{msg}</p>}
        </form>
      </Collapsible>

      {lotesDisplay.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <h3 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-700">
            Lotes Registrados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Produto</th>
                  <th className="px-5 py-3 text-right font-medium">Quantidade</th>
                  <th className="px-5 py-3 text-right font-medium">Custo Unit.</th>
                  <th className="px-5 py-3 text-right font-medium">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {lotesDisplay.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-600">{formatDate(l.data_entrada)}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">{l.nomeProduto}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{l.quantidade}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{formatBRL(l.custo_unitario)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{formatBRL(l.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

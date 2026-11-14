import { useState } from "react";
import type { Produto, Venda } from "../types";
import { supabase } from "../supabaseClient";
import { formatBRL, formatDate } from "../calculations";
import { Collapsible } from "../components/Collapsible";

interface VendasProps {
  produtos: Produto[];
  vendas: Venda[];
  refresh: () => void;
}

export function Vendas({ produtos, vendas, refresh }: VendasProps) {
  const [prodNome, setProdNome] = useState("");
  const [qtde, setQtde] = useState(1);
  const [preco, setPreco] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prod = produtos.find((p) => p.nome === prodNome);
    if (!prod) return;
    setSaving(true);
    const { error } = await supabase.from("vendas").insert({
      produto_id: prod.id,
      quantidade: qtde,
      preco_venda: preco,
    });
    setSaving(false);
    if (error) {
      setMsg(`Erro: ${error.message}`);
      return;
    }
    setMsg("Venda registrada!");
    setQtde(1);
    setPreco(0);
    refresh();
  }

  const vendasDisplay = vendas.map((v) => {
    const prod = produtos.find((p) => p.id === v.produto_id);
    return {
      ...v,
      nomeProduto: prod?.nome ?? "—",
      valorTotal: v.quantidade * v.preco_venda,
    };
  });

  if (produtos.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Registro de Vendas</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          Cadastre produtos primeiro.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Registro de Vendas</h2>
        <p className="mt-1 text-slate-500">
          As vendas são usadas para calcular a elasticidade de preço e o giro de estoque de cada produto.
        </p>
      </div>

      <Collapsible title="Registrar Venda" defaultOpen>
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
            <label className="mb-1 block text-sm font-medium text-slate-600">Quantidade Vendida</label>
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
            <label className="mb-1 block text-sm font-medium text-slate-600">Preço de Venda (R$)</label>
            <input
              type="number"
              min="0"
              step="0.50"
              value={preco}
              onChange={(e) => setPreco(parseFloat(e.target.value) || 0)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <p className="mt-1 text-xs text-slate-400">
              Registre vendas a preços diferentes para calcular a elasticidade.
            </p>
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={saving || !prodNome}
              className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Registrando..." : "Registrar Venda"}
            </button>
          </div>
          {msg && <p className="sm:col-span-3 text-sm font-medium text-green-600">{msg}</p>}
        </form>
      </Collapsible>

      {vendasDisplay.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <h3 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-700">
            Vendas Registradas
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Produto</th>
                  <th className="px-5 py-3 text-right font-medium">Quantidade</th>
                  <th className="px-5 py-3 text-right font-medium">Preço Venda</th>
                  <th className="px-5 py-3 text-right font-medium">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {vendasDisplay.map((v) => (
                  <tr key={v.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-600">{formatDate(v.data_venda)}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">{v.nomeProduto}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{v.quantidade}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{formatBRL(v.preco_venda)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{formatBRL(v.valorTotal)}</td>
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

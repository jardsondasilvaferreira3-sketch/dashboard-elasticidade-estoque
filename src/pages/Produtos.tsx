import { useState } from "react";
import type { Produto } from "../types";
import { supabase } from "../supabaseClient";
import { formatBRL, formatDate } from "../calculations";
import { Collapsible } from "../components/Collapsible";
import { Trash2 } from "lucide-react";

interface ProdutosProps {
  produtos: Produto[];
  refresh: () => void;
}

export function Produtos({ produtos, refresh }: ProdutosProps) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [preco, setPreco] = useState(0);
  const [estoqueMin, setEstoqueMin] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [delSel, setDelSel] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("produtos").insert({
      nome: nome.trim(),
      categoria: categoria.trim() || "Geral",
      preco_venda: preco,
      estoque_minimo: estoqueMin,
    });
    setSaving(false);
    if (error) {
      setMsg(`Erro: ${error.message}`);
      return;
    }
    setMsg(`Produto "${nome}" cadastrado!`);
    setNome("");
    setCategoria("Geral");
    setPreco(0);
    setEstoqueMin(0);
    refresh();
  }

  async function handleDelete() {
    if (!delSel) return;
    const prod = produtos.find((p) => p.nome === delSel);
    if (!prod) return;
    const { error } = await supabase.from("produtos").delete().eq("id", prod.id);
    if (error) {
      setMsg(`Erro: ${error.message}`);
      return;
    }
    setMsg(`Produto "${delSel}" removido.`);
    setDelSel("");
    refresh();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Gerenciar Produtos</h2>

      <Collapsible title="Cadastrar Novo Produto" defaultOpen={produtos.length === 0}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Nome do produto</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Ex: Notebook Dell"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Categoria</label>
            <input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Ex: Eletrônicos"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Preço de Venda (R$)</label>
            <input
              type="number"
              step="0.50"
              min="0"
              value={preco}
              onChange={(e) => setPreco(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Estoque Mínimo</label>
            <input
              type="number"
              step="1"
              min="0"
              value={estoqueMin}
              onChange={(e) => setEstoqueMin(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
          {msg && <p className="sm:col-span-2 text-sm font-medium text-green-600">{msg}</p>}
        </form>
      </Collapsible>

      {produtos.length > 0 && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <h3 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-700">
              Produtos Cadastrados
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-5 py-3 font-medium">Nome</th>
                    <th className="px-5 py-3 font-medium">Categoria</th>
                    <th className="px-5 py-3 text-right font-medium">Preço Venda</th>
                    <th className="px-5 py-3 text-right font-medium">Estoque Mínimo</th>
                    <th className="px-5 py-3 font-medium">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-700">{p.nome}</td>
                      <td className="px-5 py-3 text-slate-500">{p.categoria}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{formatBRL(p.preco_venda)}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{p.estoque_minimo}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(p.criado_em)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-slate-700">Remover Produto</h3>
            <div className="flex items-center gap-3">
              <select
                value={delSel}
                onChange={(e) => setDelSel(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="">Selecione um produto...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.nome}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDelete}
                disabled={!delSel}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

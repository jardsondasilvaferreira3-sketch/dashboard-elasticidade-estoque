import { useState } from "react";
import { supabase } from "../supabaseClient";
import type { Produto } from "../types";
import { Database, Loader2 } from "lucide-react";

interface DadosExemploProps {
  refresh: () => void;
}

export function DadosExemplo({ refresh }: DadosExemploProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function carregarDados() {
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const produtosExemplo = [
        { nome: "Notebook Dell", categoria: "Eletronicos", preco_venda: 3500.0, estoque_minimo: 5 },
        { nome: "Mouse Logitech", categoria: "Acessorios", preco_venda: 120.0, estoque_minimo: 20 },
        { nome: "Teclado Mecanico", categoria: "Acessorios", preco_venda: 280.0, estoque_minimo: 10 },
        { nome: "Monitor 24 Samsung", categoria: "Eletronicos", preco_venda: 890.0, estoque_minimo: 8 },
        { nome: "Cabo HDMI 2m", categoria: "Acessorios", preco_venda: 25.0, estoque_minimo: 50 },
        { nome: "Webcam HD", categoria: "Eletronicos", preco_venda: 180.0, estoque_minimo: 12 },
      ];
      for (const p of produtosExemplo) {
        const { error: e } = await supabase.from("produtos").insert(p);
        if (e) throw e;
      }

      const { data: prodData, error: prodErr } = await supabase.from("produtos").select("*");
      if (prodErr) throw prodErr;
      const prodMap = new Map<string, string>();
      (prodData as Produto[]).forEach((p) => prodMap.set(p.nome, p.id));

      const lotesExemplo: [string, number, number][] = [
        ["Notebook Dell", 10, 2800.0],
        ["Notebook Dell", 5, 3000.0],
        ["Mouse Logitech", 50, 60.0],
        ["Mouse Logitech", 30, 70.0],
        ["Teclado Mecanico", 20, 150.0],
        ["Monitor 24 Samsung", 15, 650.0],
        ["Cabo HDMI 2m", 200, 8.0],
        ["Webcam HD", 25, 90.0],
      ];
      for (const [nomeProd, qtde, custo] of lotesExemplo) {
        const pid = prodMap.get(nomeProd);
        if (!pid) continue;
        const { error: e } = await supabase.from("lotes_estoque").insert({
          produto_id: pid,
          quantidade: qtde,
          custo_unitario: custo,
        });
        if (e) throw e;
      }

      const vendasExemplo: [string, number, number][] = [
        ["Notebook Dell", 3, 3500.0],
        ["Notebook Dell", 2, 3200.0],
        ["Notebook Dell", 1, 3800.0],
        ["Mouse Logitech", 15, 120.0],
        ["Mouse Logitech", 10, 100.0],
        ["Mouse Logitech", 8, 130.0],
        ["Teclado Mecanico", 5, 280.0],
        ["Teclado Mecanico", 3, 250.0],
        ["Monitor 24 Samsung", 6, 890.0],
        ["Monitor 24 Samsung", 4, 850.0],
        ["Cabo HDMI 2m", 40, 25.0],
        ["Cabo HDMI 2m", 30, 20.0],
        ["Cabo HDMI 2m", 20, 30.0],
        ["Webcam HD", 5, 180.0],
        ["Webcam HD", 3, 200.0],
      ];
      for (const [nomeProd, qtde, preco] of vendasExemplo) {
        const pid = prodMap.get(nomeProd);
        if (!pid) continue;
        const { error: e } = await supabase.from("vendas").insert({
          produto_id: pid,
          quantidade: qtde,
          preco_venda: preco,
        });
        if (e) throw e;
      }

      setMsg("Dados de exemplo carregados! Vá para Visão Geral para ver o dashboard.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cadastrar Dados de Exemplo</h2>
        <p className="mt-1 text-slate-500">
          Carrega um conjunto de produtos, lotes e vendas de exemplo para demonstrar o dashboard.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Database className="h-8 w-8 text-primary-600" />
          </div>
          <p className="mb-6 max-w-md text-slate-500">
            Serão cadastrados 6 produtos (eletrônicos e acessórios), 8 lotes de estoque com custos variados
            e 15 vendas a preços diferentes — suficientes para demonstrar a média ponderada, elasticidade e
            score de manutenção.
          </p>
          <button
            onClick={carregarDados}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando...
              </>
            ) : (
              "Carregar Dados de Exemplo"
            )}
          </button>
          {msg && <p className="mt-4 text-sm font-medium text-green-600">{msg}</p>}
          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

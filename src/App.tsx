import { useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Database,
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useData } from "./useData";
import { buildAnalise } from "./calculations";
import { Overview } from "./pages/Overview";
import { Analysis } from "./pages/Analysis";
import { Produtos } from "./pages/Produtos";
import { Lotes } from "./pages/Lotes";
import { Vendas } from "./pages/Vendas";
import { DadosExemplo } from "./pages/DadosExemplo";

type PageId = "overview" | "analysis" | "produtos" | "lotes" | "vendas" | "dados";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Visão Geral", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "analysis", label: "Análise de Produtos", icon: <BarChart3 className="h-5 w-5" /> },
  { id: "produtos", label: "Produtos", icon: <Package className="h-5 w-5" /> },
  { id: "lotes", label: "Lotes de Estoque", icon: <Boxes className="h-5 w-5" /> },
  { id: "vendas", label: "Vendas", icon: <ShoppingCart className="h-5 w-5" /> },
  { id: "dados", label: "Cadastrar Dados", icon: <Database className="h-5 w-5" /> },
];

export function App() {
  const [page, setPage] = useState<PageId>("overview");
  const { produtos, lotes, vendas, loading, error, refresh } = useData();

  const analise = useMemo(
    () => buildAnalise(produtos, lotes, vendas),
    [produtos, lotes, vendas]
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Dashboard</h1>
            <p className="text-xs text-slate-400">Gestão de Estoque</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                page === item.id
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-400">
            Média ponderada • Elasticidade • Score
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Mobile nav */}
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
                  page === item.id
                    ? "bg-primary-50 text-primary-700"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              Erro ao carregar dados: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {produtos.length === 0 && page !== "dados" && page !== "produtos" && (
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
                  Nenhum produto cadastrado ainda. Vá para <strong>Cadastrar Dados</strong> para começar.
                </div>
              )}

              {page === "overview" && <Overview analise={analise} />}
              {page === "analysis" && <Analysis analise={analise} lotes={lotes} vendas={vendas} />}
              {page === "produtos" && <Produtos produtos={produtos} refresh={refresh} />}
              {page === "lotes" && <Lotes produtos={produtos} lotes={lotes} refresh={refresh} />}
              {page === "vendas" && <Vendas produtos={produtos} vendas={vendas} refresh={refresh} />}
              {page === "dados" && <DadosExemplo refresh={refresh} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

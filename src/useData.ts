import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { LoteEstoque, Produto, Venda } from "./types";

export function useData() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [lotes, setLotes] = useState<LoteEstoque[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, lotesRes, vendasRes] = await Promise.all([
        supabase.from("produtos").select("*").order("nome"),
        supabase.from("lotes_estoque").select("*").order("data_entrada"),
        supabase.from("vendas").select("*").order("data_venda"),
      ]);
      if (prodRes.error) throw prodRes.error;
      if (lotesRes.error) throw lotesRes.error;
      if (vendasRes.error) throw vendasRes.error;
      setProdutos(prodRes.data as Produto[]);
      setLotes(lotesRes.data as LoteEstoque[]);
      setVendas(vendasRes.data as Venda[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { produtos, lotes, vendas, loading, error, refresh };
}

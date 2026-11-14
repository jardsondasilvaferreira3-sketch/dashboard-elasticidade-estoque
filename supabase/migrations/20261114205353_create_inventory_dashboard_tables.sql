/*
# Tabelas do Dashboard de Estoque

1. Novas Tabelas
- `produtos`: Cadastro de produtos com categoria, preço de venda e preço de custo
- `lotes_estoque`: Lotes de entrada de estoque (quantidade + custo unitário), usados para média ponderada
- `vendas`: Registro de vendas por produto, com preço e quantidade, usado para elasticidade

2. Segurança
- RLS habilitado em todas as tabelas
- Permissões CRUD para anon e authenticated (app sem login)
- Políticas liberadas (USING true) pois os dados são compartilhados/publicos

3. Observações
- A média ponderada do custo é calculada a partir dos lotes_estoque: soma(qtde * custo) / soma(qtde)
- A elasticidade-preço é calculada a partir das vendas: %variação quantidade / %variação preço
- "Vale a pena manter" combina margem, giro de estoque e elasticidade em um score 0-100
*/

CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text DEFAULT 'Geral',
  preco_venda numeric(12,2) NOT NULL DEFAULT 0,
  estoque_minimo integer NOT NULL DEFAULT 0,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON produtos TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_produtos" ON produtos;
CREATE POLICY "anon_select_produtos" ON produtos FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_produtos" ON produtos;
CREATE POLICY "anon_insert_produtos" ON produtos FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_produtos" ON produtos;
CREATE POLICY "anon_update_produtos" ON produtos FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_produtos" ON produtos;
CREATE POLICY "anon_delete_produtos" ON produtos FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS lotes_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade integer NOT NULL DEFAULT 0,
  custo_unitario numeric(12,2) NOT NULL DEFAULT 0,
  data_entrada timestamptz DEFAULT now()
);

ALTER TABLE lotes_estoque ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON lotes_estoque TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_lotes" ON lotes_estoque;
CREATE POLICY "anon_select_lotes" ON lotes_estoque FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lotes" ON lotes_estoque;
CREATE POLICY "anon_insert_lotes" ON lotes_estoque FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lotes" ON lotes_estoque;
CREATE POLICY "anon_update_lotes" ON lotes_estoque FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lotes" ON lotes_estoque;
CREATE POLICY "anon_delete_lotes" ON lotes_estoque FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade integer NOT NULL DEFAULT 1,
  preco_venda numeric(12,2) NOT NULL DEFAULT 0,
  data_venda timestamptz DEFAULT now()
);

ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON vendas TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_vendas" ON vendas;
CREATE POLICY "anon_select_vendas" ON vendas FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_vendas" ON vendas;
CREATE POLICY "anon_insert_vendas" ON vendas FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_vendas" ON vendas;
CREATE POLICY "anon_update_vendas" ON vendas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_vendas" ON vendas;
CREATE POLICY "anon_delete_vendas" ON vendas FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lotes_produto ON lotes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_vendas_produto ON vendas(produto_id);

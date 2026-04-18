-- ============================================================
--  GestãoPro — Schema Supabase
--  Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Empresas
CREATE TABLE empresas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL,
  cnpj       text,
  plano      text DEFAULT 'basico',
  created_at timestamptz DEFAULT now()
);

-- 2. Usuários (espelho do auth.users)
CREATE TABLE usuarios (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome       text,
  email      text,
  role       text DEFAULT 'operador',
  created_at timestamptz DEFAULT now()
);

-- 3. Produtos / Estoque
CREATE TABLE produtos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  codigo          text,
  categoria       text,
  preco           numeric(12,2) DEFAULT 0,
  custo           numeric(12,2) DEFAULT 0,
  estoque         int DEFAULT 0,
  estoque_minimo  int DEFAULT 5,
  created_at      timestamptz DEFAULT now()
);

-- 4. Vendas (PDV)
CREATE TABLE vendas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  itens      jsonb,
  subtotal   numeric(12,2),
  desconto   numeric(12,2) DEFAULT 0,
  total      numeric(12,2),
  pagamento  text,
  created_at timestamptz DEFAULT now()
);

-- 5. Caixa
CREATE TABLE caixa (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    uuid REFERENCES empresas(id) ON DELETE CASCADE,
  data          date NOT NULL,
  saldo_inicial numeric(12,2) DEFAULT 0,
  saldo_final   numeric(12,2),
  status        text DEFAULT 'aberto',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE caixa_movimentos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caixa_id   uuid REFERENCES caixa(id) ON DELETE CASCADE,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  tipo       text,  -- 'entrada' | 'saida'
  descricao  text,
  valor      numeric(12,2),
  created_at timestamptz DEFAULT now()
);

-- 6. Financeiro (CP / CR)
CREATE TABLE financeiro (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  uuid REFERENCES empresas(id) ON DELETE CASCADE,
  tipo        text,  -- 'receita' | 'despesa'
  descricao   text,
  categoria   text,
  valor       numeric(12,2),
  vencimento  date,
  status      text DEFAULT 'pendente',  -- 'pendente' | 'pago'
  created_at  timestamptz DEFAULT now()
);

-- 7. Ordens de Serviço
CREATE TABLE ordens_servico (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   uuid REFERENCES empresas(id) ON DELETE CASCADE,
  cliente      text,
  telefone     text,
  equipamento  text,
  problema     text,
  tecnico      text,
  valor        numeric(12,2) DEFAULT 0,
  prazo        date,
  status       text DEFAULT 'aberta',  -- aberta | andamento | concluida | cancelada
  observacoes  text,
  created_at   timestamptz DEFAULT now()
);

-- 8. Notas Fiscais
CREATE TABLE notas_fiscais (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id       uuid REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_nome     text,
  cliente_cpf_cnpj text,
  cliente_email    text,
  descricao        text,
  valor            numeric(12,2),
  ncm              text,
  cfop             text,
  natureza_operacao text,
  status           text DEFAULT 'emitindo',
  chave            text,
  xml_url          text,
  created_at       timestamptz DEFAULT now()
);

-- 9. Suporte / Tickets
CREATE TABLE suporte_tickets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     uuid REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_email  text,
  assunto        text,
  mensagem       text,
  prioridade     text DEFAULT 'normal',
  status         text DEFAULT 'aberto',
  created_at     timestamptz DEFAULT now()
);

-- ============================================================
--  RLS — Row Level Security (cada empresa só vê seus dados)
-- ============================================================

ALTER TABLE empresas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa            ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa_movimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais    ENABLE ROW LEVEL SECURITY;
ALTER TABLE suporte_tickets  ENABLE ROW LEVEL SECURITY;

-- Helper: retorna empresa_id do usuário logado
CREATE OR REPLACE FUNCTION minha_empresa_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT empresa_id FROM usuarios WHERE id = auth.uid()
$$;

-- Policies para cada tabela
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['produtos','vendas','caixa','caixa_movimentos','financeiro','ordens_servico','notas_fiscais','suporte_tickets']
  LOOP
    EXECUTE format('
      CREATE POLICY "empresa_%1$s" ON %1$s
      USING (empresa_id = minha_empresa_id())
      WITH CHECK (empresa_id = minha_empresa_id());
    ', t);
  END LOOP;
END;
$$;

CREATE POLICY "propria_empresa" ON empresas
  USING (id = minha_empresa_id());

CREATE POLICY "proprio_usuario" ON usuarios
  USING (empresa_id = minha_empresa_id());

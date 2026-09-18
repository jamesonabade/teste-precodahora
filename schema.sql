-- Schema para Automação Preço da Hora Bahia - DIEESE Cesta Básica

CREATE TABLE IF NOT EXISTS estabelecimentos (
    id SERIAL PRIMARY KEY,
    codigo_planilha VARCHAR(10) UNIQUE NOT NULL, -- Ex: M1, M2 ... M40
    nome VARCHAR(255) NOT NULL,
    bairro VARCHAR(100),
    municipio VARCHAR(100) DEFAULT 'Vitória da Conquista',
    uf VARCHAR(2) DEFAULT 'BA',
    cnpj VARCHAR(20),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    semana_coleta INT,
    dia_semana VARCHAR(30),
    pesquisador VARCHAR(100),
    critica VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    endereco TEXT
);

ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS endereco TEXT;

CREATE TABLE IF NOT EXISTS produtos_catalogo (
    id SERIAL PRIMARY KEY,
    codigo_produto VARCHAR(50) NOT NULL, -- Ex: 1.1.05.01
    categoria VARCHAR(150),
    item_cesta VARCHAR(150),
    marca_especificacao VARCHAR(255),
    gtin VARCHAR(50),
    tipo_busca VARCHAR(20) DEFAULT 'GTIN', -- 'GTIN' ou 'TERMO'
    termo_busca VARCHAR(255),
    unidade_medida VARCHAR(20) DEFAULT 'UN',
    regra_calculo VARCHAR(50) DEFAULT 'PADRAO', -- 'PADRAO', 'PAO_KG', 'OVO_UNIDADE'
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coletas_lote (
    id SERIAL PRIMARY KEY,
    mes_ano_referencia VARCHAR(20) NOT NULL, -- Ex: 2026-09
    semana INT,
    data_inicio TIMESTAMPTZ DEFAULT NOW(),
    data_fim TIMESTAMPTZ,
    pesquisador VARCHAR(100),
    critica VARCHAR(100),
    status VARCHAR(30) DEFAULT 'EM_ANDAMENTO', -- 'EM_ANDAMENTO', 'CONCLUIDO', 'FALHA'
    observacoes TEXT
);

CREATE TABLE IF NOT EXISTS precos_coletados (
    id SERIAL PRIMARY KEY,
    coleta_id INT REFERENCES coletas_lote(id) ON DELETE CASCADE,
    estabelecimento_id INT REFERENCES estabelecimentos(id),
    produto_id INT REFERENCES produtos_catalogo(id),
    gtin_consultado VARCHAR(50),
    gtin_encontrado VARCHAR(50),
    descricao_nfe TEXT,
    preco_unitario_nfe DECIMAL(12, 4),
    preco_liquido_nfe DECIMAL(12, 4),
    preco_bruto_nfe DECIMAL(12, 4),
    desconto_nfe DECIMAL(12, 4),
    preco_final_coletado DECIMAL(12, 4) NOT NULL, -- Preço sem promoção (precoBruto) normalizado
    unidade_medida_nfe VARCHAR(20),
    data_emissao_nfe TIMESTAMPTZ,
    intervalo_tempo VARCHAR(100),
    cnpj_estabelecimento VARCHAR(20),
    nome_estabelecimento_nfe VARCHAR(255),
    endereco_estabelecimento_nfe TEXT,
    distancia_km DECIMAL(8, 2),
    alerta_outlier BOOLEAN DEFAULT FALSE,
    motivo_alerta TEXT,
    raw_payload JSONB,
    status_conferencia VARCHAR(30) DEFAULT 'PENDENTE',
    conferido_em TIMESTAMPTZ,
    conferido_por VARCHAR(100),
    observacao_conferencia TEXT,
    data_coleta TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE precos_coletados ADD COLUMN IF NOT EXISTS status_conferencia VARCHAR(30) DEFAULT 'PENDENTE';
ALTER TABLE precos_coletados ADD COLUMN IF NOT EXISTS conferido_em TIMESTAMPTZ;
ALTER TABLE precos_coletados ADD COLUMN IF NOT EXISTS conferido_por VARCHAR(100);
ALTER TABLE precos_coletados ADD COLUMN IF NOT EXISTS observacao_conferencia TEXT;
ALTER TABLE precos_coletados DROP CONSTRAINT IF EXISTS precos_coletados_coleta_id_fkey;
ALTER TABLE precos_coletados ALTER COLUMN preco_final_coletado DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_precos_coleta_estab_prod ON precos_coletados (coleta_id, estabelecimento_id, produto_id);

CREATE TABLE IF NOT EXISTS historico_medias (
    id SERIAL PRIMARY KEY,
    mes_ano_referencia VARCHAR(20) NOT NULL,
    produto_id INT REFERENCES produtos_catalogo(id),
    preco_medio DECIMAL(12, 4) NOT NULL,
    preco_minimo DECIMAL(12, 4),
    preco_maximo DECIMAL(12, 4),
    total_coletas INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices estratégicos para performance em consultas e agregações
CREATE INDEX IF NOT EXISTS idx_estab_cnpj ON estabelecimentos(cnpj);
CREATE INDEX IF NOT EXISTS idx_estab_codigo ON estabelecimentos(codigo_planilha);
CREATE INDEX IF NOT EXISTS idx_prod_gtin ON produtos_catalogo(gtin);
CREATE INDEX IF NOT EXISTS idx_precos_coleta ON precos_coletados(coleta_id);
CREATE INDEX IF NOT EXISTS idx_precos_estab_prod ON precos_coletados(estabelecimento_id, produto_id);
CREATE INDEX IF NOT EXISTS idx_precos_data_coleta ON precos_coletados(data_coleta);
CREATE INDEX IF NOT EXISTS idx_precos_raw_payload ON precos_coletados USING gin(raw_payload);

-- Histórico de Lotes e Execuções da Automação
CREATE TABLE IF NOT EXISTS historico_execucoes (
    id SERIAL PRIMARY KEY,
    semana_coleta INTEGER,
    mercado_codigo VARCHAR(20),
    total_buscas INTEGER DEFAULT 0,
    total_encontrados INTEGER DEFAULT 0,
    total_nao_encontrados INTEGER DEFAULT 0,
    total_alertas INTEGER DEFAULT 0,
    duracao_segundos NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'CONCLUIDO',
    mensagem_resumo TEXT,
    logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_execucoes_created_at ON historico_execucoes(created_at DESC);

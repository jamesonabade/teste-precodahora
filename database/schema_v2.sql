-- ==============================================================================
-- SCHEMA V2: SISTEMA DE COLETA & VALIDAÇÃO DIEESE / PREÇO DA HORA BAHIA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- GRUPO 1: CADASTROS BASE (DIMENSÕES)
-- ------------------------------------------------------------------------------

-- Tabela 1: Estabelecimentos / Mercados
CREATE TABLE IF NOT EXISTS tb_estabelecimento (
    id_estabelecimento SERIAL PRIMARY KEY,
    codigo_externo VARCHAR(20) NOT NULL UNIQUE, -- Ex: 'E1.25', 'M1'
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),                           -- CNPJ para filtro direto no Preço da Hora
    bairro VARCHAR(100),
    municipio VARCHAR(100) DEFAULT 'Vitória da Conquista',
    uf VARCHAR(2) DEFAULT 'BA',
    endereco TEXT,
    lat_long VARCHAR(100),                      -- Latitude, Longitude para busca geográfica por raio
    status_ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 2: Catálogo de Produtos DIEESE
CREATE TABLE IF NOT EXISTS tb_produto_dieese (
    id_produto SERIAL PRIMARY KEY,
    codigo_dieese VARCHAR(50) NOT NULL UNIQUE,  -- Ex: '1.1.05.01'
    descricao_item VARCHAR(255) NOT NULL,       -- Ex: 'Açúcar Cristal Vida 1Kg'
    codigo_barras VARCHAR(50),                  -- EAN / GTIN utilizado pelo robô
    volume_peso NUMERIC(10, 3),                 -- Quantidade / Peso unitário
    unidade_medida VARCHAR(20) DEFAULT 'UN',    -- KG, UN, LT, DZ
    categoria VARCHAR(100),                     -- Categoria da Cesta Básica (Açúcar, Carne, etc)
    regra_calculo VARCHAR(50) DEFAULT 'PADRAO', -- 'PADRAO', 'PAO_KG', 'OVO_UNIDADE'
    status_ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 3: Usuários (Robôs e Validadores Humanos)
CREATE TABLE IF NOT EXISTS tb_usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,                 -- Ex: 'Sistema_Automacao_Bot', 'Mateus', 'Mécia'
    email VARCHAR(150) UNIQUE,
    papel VARCHAR(20) NOT NULL CHECK (papel IN ('BOT', 'VALIDADOR', 'ADMIN')),
    status_ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- GRUPO 2: O MOTOR DA AUTOMAÇÃO (FATO BRUTO)
-- ------------------------------------------------------------------------------

-- Tabela 4: Coleta Automatizada (Trabalho do Robô / SEFAZ Preço da Hora)
CREATE TABLE IF NOT EXISTS tb_coleta_automatizada (
    id_coleta SERIAL PRIMARY KEY,
    id_estabelecimento INT NOT NULL REFERENCES tb_estabelecimento(id_estabelecimento) ON DELETE CASCADE,
    id_produto INT NOT NULL REFERENCES tb_produto_dieese(id_produto) ON DELETE CASCADE,
    data_hora_extracao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    preco_extraido DECIMAL(10, 2),              -- Preço extraído da NF-e
    data_emissao_nfe TIMESTAMPTZ,               -- Momento exato em que a NF-e foi emitida
    link_comprovante_nfe TEXT,                  -- URL do comprovante / print / chave NF-e
    status_validacao VARCHAR(30) DEFAULT 'PENDENTE' NOT NULL 
        CHECK (status_validacao IN ('PENDENTE', 'VALIDADO', 'REJEITADO', 'NAO_ENCONTRADO')),
    alerta_outlier BOOLEAN DEFAULT FALSE,
    motivo_alerta TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- GRUPO 3: A ETAPA HUMANA (VALIDAÇÃO / CRÍTICA)
-- ------------------------------------------------------------------------------

-- Tabela 5: Validação e Crítica (Trabalho Humano / Auditoria)
CREATE TABLE IF NOT EXISTS tb_validacao_critica (
    id_validacao SERIAL PRIMARY KEY,
    id_coleta INT NOT NULL REFERENCES tb_coleta_automatizada(id_coleta) ON DELETE CASCADE,
    id_usuario_validador INT NOT NULL REFERENCES tb_usuario(id_usuario),
    data_hora_validacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    decisao VARCHAR(30) NOT NULL 
        CHECK (decisao IN ('APROVADO', 'REJEITADO', 'CORRIGIDO_MANUALMENTE')),
    preco_final_validado DECIMAL(10, 2) NOT NULL,
    motivo_rejeicao TEXT,
    observacoes TEXT
);

-- ------------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tb_estab_cnpj ON tb_estabelecimento(cnpj);
CREATE INDEX IF NOT EXISTS idx_tb_estab_cod_externo ON tb_estabelecimento(codigo_externo);
CREATE INDEX IF NOT EXISTS idx_tb_prod_gtin ON tb_produto_dieese(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_tb_prod_cod_dieese ON tb_produto_dieese(codigo_dieese);

CREATE INDEX IF NOT EXISTS idx_tb_coleta_estab_prod ON tb_coleta_automatizada(id_estabelecimento, id_produto);
CREATE INDEX IF NOT EXISTS idx_tb_coleta_status ON tb_coleta_automatizada(status_validacao);
CREATE INDEX IF NOT EXISTS idx_tb_coleta_data_extracao ON tb_coleta_automatizada(data_hora_extracao DESC);
CREATE INDEX IF NOT EXISTS idx_tb_coleta_emissao_nfe ON tb_coleta_automatizada(data_emissao_nfe);

CREATE INDEX IF NOT EXISTS idx_tb_val_coleta ON tb_validacao_critica(id_coleta);
CREATE INDEX IF NOT EXISTS idx_tb_val_decisao ON tb_validacao_critica(decisao);

-- ------------------------------------------------------------------------------
-- VIEW OFICIAL: PREÇOS VALIDADOS PARA O DIEESE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_precos_oficiais_dieese AS
SELECT 
    v.id_validacao,
    c.id_coleta,
    p.codigo_dieese,
    p.descricao_item,
    p.categoria,
    p.unidade_medida,
    e.codigo_externo AS codigo_mercado,
    e.nome AS nome_mercado,
    e.cnpj AS cnpj_mercado,
    e.bairro AS bairro_mercado,
    c.preco_extraido AS preco_original_robo,
    v.preco_final_validado,
    v.decisao,
    v.motivo_rejeicao,
    c.data_emissao_nfe,
    c.link_comprovante_nfe,
    u.nome AS validador_nome,
    v.data_hora_validacao
FROM tb_validacao_critica v
JOIN tb_coleta_automatizada c ON c.id_coleta = v.id_coleta
JOIN tb_produto_dieese p ON p.id_produto = c.id_produto
JOIN tb_estabelecimento e ON e.id_estabelecimento = c.id_estabelecimento
JOIN tb_usuario u ON u.id_usuario = v.id_usuario_validador
WHERE v.decisao IN ('APROVADO', 'CORRIGIDO_MANUALMENTE');

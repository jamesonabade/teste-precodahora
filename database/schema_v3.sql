-- ==============================================================================
-- SCHEMA V3: CALENDÁRIO DE COLETAS, RESUMOS/MÉDIAS DIEESE E HORÁRIOS ESTRATÉGICOS
-- ==============================================================================

-- 1. Ajustes em tb_estabelecimento
ALTER TABLE tb_estabelecimento ADD COLUMN IF NOT EXISTS codigo_estabelecimento VARCHAR(20);
ALTER TABLE tb_estabelecimento ALTER COLUMN codigo_externo DROP NOT NULL;
ALTER TABLE tb_estabelecimento DROP CONSTRAINT IF EXISTS tb_estabelecimento_codigo_externo_key;

COMMENT ON COLUMN tb_estabelecimento.codigo_estabelecimento IS 'Código do estabelecimento na pesquisa DIEESE no padrão M1 a M40.';
COMMENT ON COLUMN tb_estabelecimento.codigo_externo IS 'Código externo legado do DIEESE (ex: E1.25, E3.05, E1.15) quando aplicável.';

-- 2. Tabela de Calendário de Coleta (Escala e Acompanhamento de Metas)
CREATE TABLE IF NOT EXISTS tb_calendario_coleta (
    id_calendario SERIAL PRIMARY KEY,
    id_estabelecimento INT REFERENCES tb_estabelecimento(id_estabelecimento) ON DELETE CASCADE,
    codigo_estabelecimento VARCHAR(20) NOT NULL,
    codigo_externo VARCHAR(20),
    nome_estabelecimento VARCHAR(255) NOT NULL,
    bairro VARCHAR(100),
    semana INT NOT NULL CHECK (semana BETWEEN 1 AND 5),
    dia_semana VARCHAR(50) NOT NULL,
    data_prevista DATE,
    data_efetiva DATE,
    pesquisador VARCHAR(100),
    critica_validador VARCHAR(100),
    prints_validador VARCHAR(100),
    total_esperado INT DEFAULT 76 NOT NULL,
    qtd_registrada INT DEFAULT 0 NOT NULL,
    qtd_validada_humano INT DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDENTE' NOT NULL CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tb_cal_cod_estab ON tb_calendario_coleta(codigo_estabelecimento);
CREATE INDEX IF NOT EXISTS idx_tb_cal_semana ON tb_calendario_coleta(semana);
CREATE INDEX IF NOT EXISTS idx_tb_cal_data_efetiva ON tb_calendario_coleta(data_efetiva);

COMMENT ON TABLE tb_calendario_coleta IS 'Escala e cronograma de coletas DIEESE por mercado, semana, pesquisador e contadores de metas.';
COMMENT ON COLUMN tb_calendario_coleta.id_calendario IS 'Chave primária do agendamento no calendário.';
COMMENT ON COLUMN tb_calendario_coleta.id_estabelecimento IS 'Chave estrangeira vinculando ao estabelecimento.';
COMMENT ON COLUMN tb_calendario_coleta.codigo_estabelecimento IS 'Identificador DIEESE do mercado (M1 a M40).';
COMMENT ON COLUMN tb_calendario_coleta.codigo_externo IS 'Código externo da pesquisa (E1.25, etc.).';
COMMENT ON COLUMN tb_calendario_coleta.nome_estabelecimento IS 'Nome do mercado na escala da semana.';
COMMENT ON COLUMN tb_calendario_coleta.bairro IS 'Bairro do estabelecimento.';
COMMENT ON COLUMN tb_calendario_coleta.semana IS 'Número da semana do mês DIEESE (1 a 4).';
COMMENT ON COLUMN tb_calendario_coleta.dia_semana IS 'Dia da semana programado para a coleta (ex: Segunda-Feira).';
COMMENT ON COLUMN tb_calendario_coleta.data_prevista IS 'Data inicial prevista no cronograma.';
COMMENT ON COLUMN tb_calendario_coleta.data_efetiva IS 'Data real/efetiva em que os preços foram coletados.';
COMMENT ON COLUMN tb_calendario_coleta.pesquisador IS 'Nome do pesquisador encarregado da coleta física ou remota.';
COMMENT ON COLUMN tb_calendario_coleta.critica_validador IS 'Nome do auditor responsável pela crítica e aprovação dos dados.';
COMMENT ON COLUMN tb_calendario_coleta.prints_validador IS 'Nome do responsável pela conferência de prints e comprovantes.';
COMMENT ON COLUMN tb_calendario_coleta.total_esperado IS 'Meta total de itens da cesta a serem pesquisados neste mercado (Padrão: 76).';
COMMENT ON COLUMN tb_calendario_coleta.qtd_registrada IS 'Total de preços registrados até o momento pelo robô ou formulário.';
COMMENT ON COLUMN tb_calendario_coleta.qtd_validada_humano IS 'Total de preços que passaram com sucesso pela crítica humana.';
COMMENT ON COLUMN tb_calendario_coleta.status IS 'Status da etapa de coleta (PENDENTE, EM_ANDAMENTO, CONCLUIDO).';

-- 3. Tabela de Médias de Referência do Mês Anterior (Equivalente à aba Histórico)
CREATE TABLE IF NOT EXISTS tb_media_referencia_dieese (
    id_referencia SERIAL PRIMARY KEY,
    id_produto INT REFERENCES tb_produto_dieese(id_produto) ON DELETE CASCADE,
    codigo_dieese VARCHAR(50) NOT NULL,
    descricao_item VARCHAR(255) NOT NULL,
    codigo_barras VARCHAR(50),
    mes_referencia VARCHAR(20) DEFAULT '2026-08' NOT NULL,
    preco_medio_anterior DECIMAL(10, 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_ref_prod_mes UNIQUE (codigo_dieese, descricao_item, mes_referencia)
);

CREATE INDEX IF NOT EXISTS idx_tb_ref_cod_dieese ON tb_media_referencia_dieese(codigo_dieese);
CREATE INDEX IF NOT EXISTS idx_tb_ref_gtin ON tb_media_referencia_dieese(codigo_barras);

COMMENT ON TABLE tb_media_referencia_dieese IS 'Histórico de médias do mês anterior utilizado para calcular o alerta de variação > 50%.';
COMMENT ON COLUMN tb_media_referencia_dieese.id_referencia IS 'Chave primária do registro de referência.';
COMMENT ON COLUMN tb_media_referencia_dieese.id_produto IS 'Chave estrangeira do catálogo de produtos.';
COMMENT ON COLUMN tb_media_referencia_dieese.codigo_dieese IS 'Código DIEESE da categoria/item.';
COMMENT ON COLUMN tb_media_referencia_dieese.descricao_item IS 'Nome da especificação/marca do item.';
COMMENT ON COLUMN tb_media_referencia_dieese.codigo_barras IS 'Código de barras ou identificador PdH.';
COMMENT ON COLUMN tb_media_referencia_dieese.mes_referencia IS 'Mês anterior de referência (ex: 2026-08).';
COMMENT ON COLUMN tb_media_referencia_dieese.preco_medio_anterior IS 'Valor médio do mês anterior em Reais.';

-- 4. View Dinâmica do Calendário com Progresso Calculado em Tempo Real
CREATE OR REPLACE VIEW vw_calendario_progresso AS
SELECT 
    cal.id_calendario,
    cal.id_estabelecimento,
    cal.codigo_estabelecimento,
    cal.codigo_externo,
    cal.nome_estabelecimento,
    cal.bairro,
    cal.semana,
    cal.dia_semana,
    cal.data_prevista,
    cal.data_efetiva,
    cal.pesquisador,
    cal.critica_validador,
    cal.prints_validador,
    cal.total_esperado,
    COALESCE(coletas.total_coletado, cal.qtd_registrada, 0) AS qtd_registrada,
    COALESCE(validadas.total_validado, cal.qtd_validada_humano, 0) AS qtd_validada_humano,
    GREATEST(0, cal.total_esperado - COALESCE(coletas.total_coletado, cal.qtd_registrada, 0)) AS qtd_restante,
    CASE 
        WHEN COALESCE(coletas.total_coletado, cal.qtd_registrada, 0) >= cal.total_esperado THEN 'CONCLUIDO'
        WHEN COALESCE(coletas.total_coletado, cal.qtd_registrada, 0) > 0 THEN 'EM_ANDAMENTO'
        ELSE 'PENDENTE'
    END AS status_tempo_real,
    cal.updated_at
FROM tb_calendario_coleta cal
LEFT JOIN (
    SELECT id_estabelecimento, COUNT(DISTINCT id_produto) AS total_coletado
    FROM tb_coleta_automatizada
    WHERE status_validacao IN ('VALIDADO', 'PENDENTE')
    GROUP BY id_estabelecimento
) coletas ON coletas.id_estabelecimento = cal.id_estabelecimento
LEFT JOIN (
    SELECT c.id_estabelecimento, COUNT(DISTINCT c.id_produto) AS total_validado
    FROM tb_validacao_critica v
    JOIN tb_coleta_automatizada c ON c.id_coleta = v.id_coleta
    WHERE v.decisao IN ('APROVADO', 'CORRIGIDO_MANUALMENTE')
    GROUP BY c.id_estabelecimento
) validadas ON validadas.id_estabelecimento = cal.id_estabelecimento;

-- 5. View de Resumos, Totais e Médias (Equivalente à aba da planilha)
CREATE OR REPLACE VIEW vw_resumo_totais_medias AS
SELECT 
    p.id_produto,
    p.categoria,
    p.codigo_dieese,
    p.descricao_item,
    p.codigo_barras,
    p.unidade_medida,
    ref.preco_medio_anterior,
    ROUND(AVG(c.preco_extraido), 2) AS preco_medio_atual,
    MIN(c.preco_extraido) AS preco_minimo,
    MAX(c.preco_extraido) AS preco_maximo,
    COUNT(c.id_coleta) AS qtd_coletada,
    CASE 
        WHEN ref.preco_medio_anterior IS NOT NULL AND ref.preco_medio_anterior > 0 
        THEN ROUND(((AVG(c.preco_extraido) - ref.preco_medio_anterior) / ref.preco_medio_anterior) * 100, 2)
        ELSE NULL 
    END AS variacao_percentual,
    CASE 
        WHEN ref.preco_medio_anterior IS NOT NULL AND ref.preco_medio_anterior > 0 
             AND ABS((AVG(c.preco_extraido) - ref.preco_medio_anterior) / ref.preco_medio_anterior) >= 0.50
        THEN TRUE 
        ELSE FALSE 
    END AS alerta_outlier_50pct
FROM tb_produto_dieese p
LEFT JOIN tb_coleta_automatizada c ON c.id_produto = p.id_produto AND c.preco_extraido IS NOT NULL
LEFT JOIN tb_media_referencia_dieese ref ON ref.id_produto = p.id_produto OR (ref.codigo_dieese = p.codigo_dieese AND ref.descricao_item = p.descricao_item)
GROUP BY p.id_produto, p.categoria, p.codigo_dieese, p.descricao_item, p.codigo_barras, p.unidade_medida, ref.preco_medio_anterior;

-- 6. Atualização de Parâmetros de Horários Estratégicos
UPDATE tb_configuracao_automacao
SET 
    cron_agendamento = '0 12,18,19,21 * * *',
    hora_inicio_janela = '05:00:00',
    hora_fim_janela = '21:00:00',
    apenas_vendas_do_dia = TRUE,
    dias_maximos_nfe = 1,
    descricao_observacao = 'Horários estratégicos: 12:00, 18:00, 19:00 e 21:00. Lançamentos estritamente do dia.'
WHERE nome_perfil = 'PADRAO';

-- ==============================================================================
-- SCHEMA V2: SISTEMA DE COLETA & VALIDAÇÃO DIEESE / PREÇO DA HORA BAHIA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- GRUPO 1: CADASTROS BASE (DIMENSÕES)
-- ------------------------------------------------------------------------------

-- Tabela 1: Estabelecimentos / Mercados
CREATE TABLE IF NOT EXISTS tb_estabelecimento (
    id_estabelecimento SERIAL PRIMARY KEY,
    codigo_externo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    bairro VARCHAR(100),
    municipio VARCHAR(100) DEFAULT 'Vitória da Conquista',
    uf VARCHAR(2) DEFAULT 'BA',
    endereco TEXT,
    lat_long VARCHAR(100),
    status_ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 2: Catálogo de Produtos DIEESE
CREATE TABLE IF NOT EXISTS tb_produto_dieese (
    id_produto SERIAL PRIMARY KEY,
    codigo_dieese VARCHAR(50) NOT NULL,
    descricao_item VARCHAR(255) NOT NULL,
    codigo_barras VARCHAR(50),
    volume_peso NUMERIC(10, 3),
    unidade_medida VARCHAR(20) DEFAULT 'UN',
    categoria VARCHAR(100),
    regra_calculo VARCHAR(50) DEFAULT 'PADRAO',
    status_ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tb_produto_dieese DROP CONSTRAINT IF EXISTS tb_produto_dieese_codigo_dieese_key;

-- Tabela 3: Usuários (Robôs e Validadores Humanos)
CREATE TABLE IF NOT EXISTS tb_usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
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
    preco_extraido DECIMAL(10, 2),
    data_emissao_nfe TIMESTAMPTZ,
    link_comprovante_nfe TEXT,
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

-- Tabela 5: Validação e Crítica (Trabalho Humano / Auditoria DIEESE)
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
-- GRUPO 4: CONFIGURAÇÕES E PARÂMETROS DA AUTOMAÇÃO
-- ------------------------------------------------------------------------------

-- Tabela 6: Configurações Gerais do Robô e da Rotina de Coleta
CREATE TABLE IF NOT EXISTS tb_configuracao_automacao (
    id_configuracao SERIAL PRIMARY KEY,
    nome_perfil VARCHAR(100) DEFAULT 'PADRAO' UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Janela de Horário e Validade de Cupons
    hora_inicio_janela TIME DEFAULT '05:00:00' NOT NULL,
    hora_fim_janela TIME DEFAULT '21:00:00' NOT NULL,
    apenas_vendas_do_dia BOOLEAN DEFAULT TRUE NOT NULL,
    dias_maximos_nfe INT DEFAULT 1 NOT NULL,
    
    -- Agendamento e Estratégia de Re-tentativa (Retry)
    cron_agendamento VARCHAR(100) DEFAULT '0 8,12,17,21 * * *' NOT NULL,
    tentativas_max_retry INT DEFAULT 4 NOT NULL,
    intervalo_retry_minutos INT DEFAULT 180 NOT NULL,
    timeout_requisicao_segundos INT DEFAULT 30 NOT NULL,
    pausa_entre_requisicoes_ms INT DEFAULT 1200 NOT NULL,
    
    -- Filtros e Regras SEFAZ Preço da Hora
    raio_padrao_km DECIMAL(5, 2) DEFAULT 15.00 NOT NULL,
    ignorar_descontos_promocoes BOOLEAN DEFAULT TRUE NOT NULL,
    priorizar_cnpj_exato BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Crítica e Auditoria
    percentual_alerta_outlier DECIMAL(5, 2) DEFAULT 50.00 NOT NULL,
    exigir_comprovante_nfe BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Notificações (ntfy, Telegram, Webhook)
    notificacoes_ativas BOOLEAN DEFAULT TRUE NOT NULL,
    canal_notificacao VARCHAR(50) DEFAULT 'NTFY' NOT NULL,
    ntfy_topico_url VARCHAR(255) DEFAULT 'https://ntfy.sh/pdh-auto2026' NOT NULL,
    notificar_ao_iniciar BOOLEAN DEFAULT TRUE NOT NULL,
    notificar_ao_concluir BOOLEAN DEFAULT TRUE NOT NULL,
    notificar_apenas_se_houver_alertas BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Extensibilidade e Auditoria
    parametros_extras JSONB DEFAULT '{}'::jsonb,
    descricao_observacao TEXT,
    atualizado_por INT REFERENCES tb_usuario(id_usuario),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Inserção do Perfil Padrão de Configuração (se não existir)
INSERT INTO tb_configuracao_automacao (
    nome_perfil, ativo, hora_inicio_janela, hora_fim_janela, apenas_vendas_do_dia,
    cron_agendamento, tentativas_max_retry, intervalo_retry_minutos, raio_padrao_km,
    percentual_alerta_outlier, ntfy_topico_url, descricao_observacao
) VALUES (
    'PADRAO', TRUE, '05:00:00', '21:00:00', TRUE,
    '0 8,12,17,21 * * *', 4, 180, 15.00,
    50.00, 'https://ntfy.sh/pdh-auto2026', 'Configuração oficial DIEESE Cesta Básica com validação estrita de mesmo dia'
) ON CONFLICT (nome_perfil) DO NOTHING;

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
CREATE INDEX IF NOT EXISTS idx_tb_config_ativo ON tb_configuracao_automacao(ativo);

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

-- ==============================================================================
-- DICIONÁRIO DE DADOS NATIVO: COMENTÁRIOS E OBSERVAÇÕES NAS TABELAS E COLUNAS
-- ==============================================================================

-- 1. tb_estabelecimento
COMMENT ON TABLE tb_estabelecimento IS 'Dimensão de Estabelecimentos Comerciais / Mercados monitorados pela pesquisa DIEESE.';
COMMENT ON COLUMN tb_estabelecimento.id_estabelecimento IS 'Chave primária sequencial do estabelecimento.';
COMMENT ON COLUMN tb_estabelecimento.codigo_externo IS 'Identificador do mercado na planilha original do DIEESE (ex: M1 a M40, E1.25).';
COMMENT ON COLUMN tb_estabelecimento.nome IS 'Razão social ou nome fantasia do estabelecimento comercial.';
COMMENT ON COLUMN tb_estabelecimento.cnpj IS 'CNPJ numérico (14 dígitos) utilizado como filtro exato na API SEFAZ / Preço da Hora.';
COMMENT ON COLUMN tb_estabelecimento.bairro IS 'Bairro do município onde a unidade física está localizada.';
COMMENT ON COLUMN tb_estabelecimento.municipio IS 'Município de cobertura da coleta (Padrão: Vitória da Conquista).';
COMMENT ON COLUMN tb_estabelecimento.uf IS 'Unidade Federativa (Padrão: BA).';
COMMENT ON COLUMN tb_estabelecimento.endereco IS 'Endereço completo (logradouro, número, complemento) para conferência física.';
COMMENT ON COLUMN tb_estabelecimento.lat_long IS 'Coordenadas geográficas (latitude, longitude) para cálculo de raio e proximidade.';
COMMENT ON COLUMN tb_estabelecimento.status_ativo IS 'Flag que indica se o mercado deve ser consultado pelo robô (TRUE = ativo, FALSE = inativo).';
COMMENT ON COLUMN tb_estabelecimento.created_at IS 'Data e hora do cadastro do estabelecimento.';
COMMENT ON COLUMN tb_estabelecimento.updated_at IS 'Data e hora da última atualização cadastral.';

-- 2. tb_produto_dieese
COMMENT ON TABLE tb_produto_dieese IS 'Catálogo oficial de produtos, marcas e especificações da Cesta Básica DIEESE.';
COMMENT ON COLUMN tb_produto_dieese.id_produto IS 'Chave primária sequencial do produto no catálogo.';
COMMENT ON COLUMN tb_produto_dieese.codigo_dieese IS 'Código estruturado do item na metodologia DIEESE (ex: 1.1.05.01). Várias marcas podem compartilhar o mesmo código.';
COMMENT ON COLUMN tb_produto_dieese.descricao_item IS 'Nome completo e especificação da marca e apresentação (ex: Açúcar Cristal Vida 1Kg).';
COMMENT ON COLUMN tb_produto_dieese.codigo_barras IS 'Código de barras GTIN/EAN (8, 12, 13 ou 14 dígitos). Chave de busca prioritária do robô.';
COMMENT ON COLUMN tb_produto_dieese.volume_peso IS 'Quantidade nominal líquida da embalagem (ex: 1.000 para 1kg, 0.900 para 900ml).';
COMMENT ON COLUMN tb_produto_dieese.unidade_medida IS 'Unidade de medida de referência (UN, KG, LT, DZ).';
COMMENT ON COLUMN tb_produto_dieese.categoria IS 'Grupo alimentar da cesta básica (ex: Açúcar, Feijão, Arroz, Café, Leite).';
COMMENT ON COLUMN tb_produto_dieese.regra_calculo IS 'Fórmula de normalização do preço (PADRAO = valor direto, PAO_KG = conversão por kg, OVO_UNIDADE = conversão por unidade).';
COMMENT ON COLUMN tb_produto_dieese.status_ativo IS 'Flag que define se o item está ativo na rotina diária de buscas do robô.';
COMMENT ON COLUMN tb_produto_dieese.created_at IS 'Data e hora da inclusão do produto no catálogo.';

-- 3. tb_usuario
COMMENT ON TABLE tb_usuario IS 'Controle de agentes e usuários do sistema (robôs automáticos e pesquisadores humanos).';
COMMENT ON COLUMN tb_usuario.id_usuario IS 'Chave primária sequencial do usuário.';
COMMENT ON COLUMN tb_usuario.nome IS 'Nome de exibição do usuário ou identificador do agente bot.';
COMMENT ON COLUMN tb_usuario.email IS 'E-mail corporativo ou institucional para alertas e auditoria.';
COMMENT ON COLUMN tb_usuario.papel IS 'Perfil de permissão: BOT (robô raspador), VALIDADOR (pesquisador DIEESE que audita os preços) ou ADMIN (gerente do sistema).';
COMMENT ON COLUMN tb_usuario.status_ativo IS 'Define se o usuário possui acesso ativo ao sistema.';
COMMENT ON COLUMN tb_usuario.created_at IS 'Data de criação do registro de usuário.';

-- 4. tb_coleta_automatizada
COMMENT ON TABLE tb_coleta_automatizada IS 'Tabela FATO de coletas brutas obtidas pelos robôs através da SEFAZ Preço da Hora.';
COMMENT ON COLUMN tb_coleta_automatizada.id_coleta IS 'Chave primária sequencial da coleta registrada.';
COMMENT ON COLUMN tb_coleta_automatizada.id_estabelecimento IS 'Chave estrangeira apontando para o estabelecimento onde o preço foi praticado.';
COMMENT ON COLUMN tb_coleta_automatizada.id_produto IS 'Chave estrangeira apontando para o produto consultado.';
COMMENT ON COLUMN tb_coleta_automatizada.data_hora_extracao IS 'Timestamp do momento exato em que o robô executou o scraping/consulta na SEFAZ.';
COMMENT ON COLUMN tb_coleta_automatizada.preco_extraido IS 'Preço bruto extraído da NF-e (sem descontos promocionais, conforme norma DIEESE).';
COMMENT ON COLUMN tb_coleta_automatizada.data_emissao_nfe IS 'Data e hora exata em que o consumidor final efetuou a compra e o mercado emitiu a NFC-e.';
COMMENT ON COLUMN tb_coleta_automatizada.link_comprovante_nfe IS 'URL pública do comprovante da NFC-e da SEFAZ ou screenshot arquivado para auditoria.';
COMMENT ON COLUMN tb_coleta_automatizada.status_validacao IS 'Status do ciclo de vida: PENDENTE (aguarda humano), VALIDADO (homologado), REJEITADO (descartado) ou NAO_ENCONTRADO.';
COMMENT ON COLUMN tb_coleta_automatizada.alerta_outlier IS 'Indicador booleano de anomalia (>50% de variação em relação à média histórica do mês anterior).';
COMMENT ON COLUMN tb_coleta_automatizada.motivo_alerta IS 'Descrição textual do motivo que disparou o alerta de auditoria.';
COMMENT ON COLUMN tb_coleta_automatizada.raw_payload IS 'Payload JSON completo retornado pela SEFAZ/Preço da Hora para auditoria técnica detalhada.';
COMMENT ON COLUMN tb_coleta_automatizada.created_at IS 'Data de gravação da linha no banco de dados.';

-- 5. tb_validacao_critica
COMMENT ON TABLE tb_validacao_critica IS 'Registro de fé pública e decisão de auditoria humana realizada sobre os preços coletados.';
COMMENT ON COLUMN tb_validacao_critica.id_validacao IS 'Chave primária sequencial da validação.';
COMMENT ON COLUMN tb_validacao_critica.id_coleta IS 'Chave estrangeira apontando para o registro bruto original em tb_coleta_automatizada.';
COMMENT ON COLUMN tb_validacao_critica.id_usuario_validador IS 'Chave estrangeira do pesquisador DIEESE que analisou e assinou a validação do preço.';
COMMENT ON COLUMN tb_validacao_critica.data_hora_validacao IS 'Momento exato da decisão humana (homologação ou rejeição).';
COMMENT ON COLUMN tb_validacao_critica.decisao IS 'Decisão final: APROVADO (preço original aceito), REJEITADO (preço descartado) ou CORRIGIDO_MANUALMENTE (valor ajustado).';
COMMENT ON COLUMN tb_validacao_critica.preco_final_validado IS 'Preço homologado que entrará no cálculo oficial do DIEESE (preserva o original na tb_coleta_automatizada).';
COMMENT ON COLUMN tb_validacao_critica.motivo_rejeicao IS 'Justificativa formal em caso de descarte (ex: cupom emitido fora da janela, unidade divergente, erro de leitura).';
COMMENT ON COLUMN tb_validacao_critica.observacoes IS 'Anotações complementares inseridas pelo pesquisador durante a conferência.';

-- 6. tb_configuracao_automacao
COMMENT ON TABLE tb_configuracao_automacao IS 'Parâmetros operacionais centrais que regem o comportamento dos robôs e as regras de negócio DIEESE.';
COMMENT ON COLUMN tb_configuracao_automacao.id_configuracao IS 'Chave primária da configuração.';
COMMENT ON COLUMN tb_configuracao_automacao.nome_perfil IS 'Nome identificador do perfil de configuração (Padrão: PADRAO).';
COMMENT ON COLUMN tb_configuracao_automacao.ativo IS 'Indica se este perfil é o atualmente utilizado pelos robôs em execução.';
COMMENT ON COLUMN tb_configuracao_automacao.hora_inicio_janela IS 'Horário mínimo permitido para a emissão da NF-e no dia (Padrão: 05:00:00).';
COMMENT ON COLUMN tb_configuracao_automacao.hora_fim_janela IS 'Horário máximo permitido para a emissão da NF-e no dia (Padrão: 21:00:00).';
COMMENT ON COLUMN tb_configuracao_automacao.apenas_vendas_do_dia IS 'Exige estritamente que a NFC-e tenha sido emitida na mesma data civil da coleta.';
COMMENT ON COLUMN tb_configuracao_automacao.dias_maximos_nfe IS 'Tolerância máxima de dias da nota fiscal (1 = apenas cupons de hoje).';
COMMENT ON COLUMN tb_configuracao_automacao.cron_agendamento IS 'Expressão cron que governa as rodadas automáticas (ex: 0 8,12,17,21 * * * = 8h, 12h30, 17h e 21h).';
COMMENT ON COLUMN tb_configuracao_automacao.tentativas_max_retry IS 'Número máximo de rodadas de re-tentativa ao longo do dia para itens ainda não vendidos.';
COMMENT ON COLUMN tb_configuracao_automacao.intervalo_retry_minutos IS 'Tempo de espaçamento (em minutos) entre as tentativas para dar tempo ao consumidor de comprar.';
COMMENT ON COLUMN tb_configuracao_automacao.timeout_requisicao_segundos IS 'Tempo limite de espera por resposta da SEFAZ antes de considerar timeout.';
COMMENT ON COLUMN tb_configuracao_automacao.pausa_entre_requisicoes_ms IS 'Intervalo de segurança em milissegundos entre chamadas sucessivas para respeitar rate limit.';
COMMENT ON COLUMN tb_configuracao_automacao.raio_padrao_km IS 'Raio geográfico em quilômetros em torno do município para busca de ofertas.';
COMMENT ON COLUMN tb_configuracao_automacao.ignorar_descontos_promocoes IS 'Quando TRUE, captura o precoBruto em vez do precoLiquido, atendendo à metodologia DIEESE.';
COMMENT ON COLUMN tb_configuracao_automacao.priorizar_cnpj_exato IS 'Quando TRUE, só aceita preços de estabelecimentos cujo CNPJ coincide 100% com a matriz/filial cadastrada.';
COMMENT ON COLUMN tb_configuracao_automacao.percentual_alerta_outlier IS 'Percentual de tolerância de variação sobre a média do mês anterior antes de disparar alerta (Padrão: 50.00%).';
COMMENT ON COLUMN tb_configuracao_automacao.exigir_comprovante_nfe IS 'Instrui o robô a armazenar o link direto ou tirar snapshot do comprovante.';
COMMENT ON COLUMN tb_configuracao_automacao.notificacoes_ativas IS 'Chave mestre para habilitar/desabilitar disparos de notificações push/mensagens.';
COMMENT ON COLUMN tb_configuracao_automacao.canal_notificacao IS 'Canal de mensageria selecionado: NTFY, TELEGRAM, EMAIL ou WEBHOOK.';
COMMENT ON COLUMN tb_configuracao_automacao.ntfy_topico_url IS 'URL do tópico do ntfy onde os avisos da rotina são transmitidos.';
COMMENT ON COLUMN tb_configuracao_automacao.notificar_ao_iniciar IS 'Envia mensagem quando a rodada do robô é deflagrada na madrugada/manhã.';
COMMENT ON COLUMN tb_configuracao_automacao.notificar_ao_concluir IS 'Envia resumo diário com estatísticas de itens coletados, pendentes e alertas gerados.';
COMMENT ON COLUMN tb_configuracao_automacao.notificar_apenas_se_houver_alertas IS 'Modo silencioso: só notifica os pesquisadores se existirem itens com suspeita de outlier.';
COMMENT ON COLUMN tb_configuracao_automacao.parametros_extras IS 'Estrutura JSON livre para parâmetros complementares sem necessidade de alterar o schema.';
COMMENT ON COLUMN tb_configuracao_automacao.descricao_observacao IS 'Texto descritivo com a finalidade ou regras específicas do perfil.';
COMMENT ON COLUMN tb_configuracao_automacao.atualizado_por IS 'Chave do usuário administrador que realizou a última alteração nas configurações.';
COMMENT ON COLUMN tb_configuracao_automacao.created_at IS 'Data de criação do perfil de configuração.';
COMMENT ON COLUMN tb_configuracao_automacao.updated_at IS 'Data e hora da última modificação dos parâmetros.';

-- 7. vw_precos_oficiais_dieese
COMMENT ON VIEW vw_precos_oficiais_dieese IS 'Visão consolidada de fé pública para relatórios DIEESE. Contém exclusivamente preços auditados e homologados por pesquisador humano.';

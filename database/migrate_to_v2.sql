-- ==============================================================================
-- MIGRAÇÃO DE DADOS PARA O SCHEMA V2
-- ==============================================================================

-- 1. Migração de Estabelecimentos
INSERT INTO tb_estabelecimento (
    id_estabelecimento, codigo_externo, nome, cnpj, bairro, municipio, uf, endereco, lat_long, status_ativo, created_at
)
SELECT 
    e.id,
    e.codigo_planilha,
    e.nome,
    e.cnpj,
    e.bairro,
    COALESCE(e.municipio, 'Vitória da Conquista'),
    COALESCE(e.uf, 'BA'),
    COALESCE(e.endereco_completo, e.endereco, ''),
    CASE 
        WHEN e.latitude IS NOT NULL AND e.longitude IS NOT NULL THEN CONCAT(e.latitude, ',', e.longitude)
        ELSE NULL 
    END,
    COALESCE(e.ativo, TRUE),
    COALESCE(e.created_at, NOW())
FROM estabelecimentos e
ON CONFLICT (id_estabelecimento) DO UPDATE SET
    codigo_externo = EXCLUDED.codigo_externo,
    nome = EXCLUDED.nome,
    cnpj = COALESCE(EXCLUDED.cnpj, tb_estabelecimento.cnpj),
    bairro = EXCLUDED.bairro,
    endereco = COALESCE(EXCLUDED.endereco, tb_estabelecimento.endereco),
    lat_long = COALESCE(EXCLUDED.lat_long, tb_estabelecimento.lat_long),
    status_ativo = EXCLUDED.status_ativo;

SELECT setval('tb_estabelecimento_id_estabelecimento_seq', COALESCE((SELECT MAX(id_estabelecimento) FROM tb_estabelecimento), 1));

-- 2. Migração de Produtos do Catálogo DIEESE
INSERT INTO tb_produto_dieese (
    id_produto, codigo_dieese, descricao_item, codigo_barras, volume_peso, unidade_medida, categoria, regra_calculo, status_ativo, created_at
)
SELECT 
    p.id,
    p.codigo_produto,
    COALESCE(p.marca_especificacao, p.item_cesta, p.codigo_produto),
    p.gtin,
    NULL,
    COALESCE(p.unidade_medida, 'UN'),
    p.categoria,
    COALESCE(p.regra_calculo, 'PADRAO'),
    COALESCE(p.ativo, TRUE),
    COALESCE(p.created_at, NOW())
FROM produtos_catalogo p
ON CONFLICT (id_produto) DO UPDATE SET
    codigo_dieese = EXCLUDED.codigo_dieese,
    descricao_item = EXCLUDED.descricao_item,
    codigo_barras = COALESCE(EXCLUDED.codigo_barras, tb_produto_dieese.codigo_barras),
    unidade_medida = EXCLUDED.unidade_medida,
    categoria = EXCLUDED.categoria,
    regra_calculo = EXCLUDED.regra_calculo,
    status_ativo = EXCLUDED.status_ativo;

SELECT setval('tb_produto_dieese_id_produto_seq', COALESCE((SELECT MAX(id_produto) FROM tb_produto_dieese), 1));

-- 3. Inserção de Usuários Base
INSERT INTO tb_usuario (id_usuario, nome, email, papel, status_ativo)
VALUES 
    (1, 'Sistema_Automacao', 'bot@precodahora.ba.gov.br', 'BOT', TRUE),
    (2, 'Mateus_Validador', 'mateus@dieese.org.br', 'VALIDADOR', TRUE),
    (3, 'Mecia_Validador', 'mecia@dieese.org.br', 'VALIDADOR', TRUE),
    (4, 'Admin_DIEESE', 'admin@dieese.org.br', 'ADMIN', TRUE)
ON CONFLICT (id_usuario) DO UPDATE SET
    nome = EXCLUDED.nome,
    papel = EXCLUDED.papel,
    status_ativo = EXCLUDED.status_ativo;

SELECT setval('tb_usuario_id_usuario_seq', COALESCE((SELECT MAX(id_usuario) FROM tb_usuario), 1));

-- 4. Migração de Preços Coletados Anteriores
INSERT INTO tb_coleta_automatizada (
    id_coleta, id_estabelecimento, id_produto, data_hora_extracao, preco_extraido, data_emissao_nfe, 
    link_comprovante_nfe, status_validacao, alerta_outlier, motivo_alerta, raw_payload, created_at
)
SELECT 
    pc.id,
    pc.estabelecimento_id,
    pc.produto_id,
    COALESCE(pc.data_coleta, NOW()),
    pc.preco_final_coletado,
    pc.data_emissao_nfe,
    NULL,
    CASE 
        WHEN pc.status_conferencia = 'CONFERIDO' THEN 'VALIDADO'
        WHEN pc.status_conferencia = 'NAO_ENCONTRADO' THEN 'NAO_ENCONTRADO'
        WHEN pc.status_conferencia = 'DESCARTADO' THEN 'REJEITADO'
        ELSE 'PENDENTE'
    END,
    COALESCE(pc.alerta_outlier, FALSE),
    pc.motivo_alerta,
    pc.raw_payload,
    COALESCE(pc.data_coleta, NOW())
FROM precos_coletados pc
WHERE pc.preco_final_coletado IS NOT NULL
ON CONFLICT (id_coleta) DO NOTHING;

SELECT setval('tb_coleta_automatizada_id_coleta_seq', COALESCE((SELECT MAX(id_coleta) FROM tb_coleta_automatizada), 1));

-- 5. Migração de Validações Humanas Anteriores
INSERT INTO tb_validacao_critica (
    id_coleta, id_usuario_validador, data_hora_validacao, decisao, preco_final_validado, observacoes
)
SELECT 
    ca.id_coleta,
    2, -- Validador DIEESE
    COALESCE(ca.created_at, NOW()),
    'APROVADO',
    ca.preco_extraido,
    'Migração automática de conferência prévia'
FROM tb_coleta_automatizada ca
WHERE ca.status_validacao = 'VALIDADO' AND ca.preco_extraido IS NOT NULL
ON CONFLICT DO NOTHING;

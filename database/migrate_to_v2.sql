-- ==============================================================================
-- MIGRAÇÃO DE DADOS PARA O SCHEMA V2
-- ==============================================================================

-- 1. Migração de Estabelecimentos
INSERT INTO tb_estabelecimento (
    codigo_externo, nome, cnpj, bairro, municipio, uf, endereco, lat_long, status_ativo, created_at
)
SELECT 
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
ON CONFLICT (codigo_externo) DO UPDATE SET
    nome = EXCLUDED.nome,
    cnpj = COALESCE(EXCLUDED.cnpj, tb_estabelecimento.cnpj),
    bairro = EXCLUDED.bairro,
    endereco = COALESCE(EXCLUDED.endereco, tb_estabelecimento.endereco),
    lat_long = COALESCE(EXCLUDED.lat_long, tb_estabelecimento.lat_long),
    status_ativo = EXCLUDED.status_ativo;

-- 2. Migração de Produtos do Catálogo DIEESE
INSERT INTO tb_produto_dieese (
    codigo_dieese, descricao_item, codigo_barras, volume_peso, unidade_medida, categoria, regra_calculo, status_ativo, created_at
)
SELECT 
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
ON CONFLICT (codigo_dieese) DO UPDATE SET
    descricao_item = EXCLUDED.descricao_item,
    codigo_barras = COALESCE(EXCLUDED.codigo_barras, tb_produto_dieese.codigo_barras),
    unidade_medida = EXCLUDED.unidade_medida,
    categoria = EXCLUDED.categoria,
    regra_calculo = EXCLUDED.regra_calculo,
    status_ativo = EXCLUDED.status_ativo;

-- 3. Inserção de Usuários Base
INSERT INTO tb_usuario (nome, email, papel, status_ativo)
VALUES 
    ('Sistema_Automacao', 'bot@precodahora.ba.gov.br', 'BOT', TRUE),
    ('Mateus_Validador', 'mateus@dieese.org.br', 'VALIDADOR', TRUE),
    ('Mecia_Validador', 'mecia@dieese.org.br', 'VALIDADOR', TRUE),
    ('Admin_DIEESE', 'admin@dieese.org.br', 'ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 4. Migração de Preços Coletados Anteriores (se houver)
INSERT INTO tb_coleta_automatizada (
    id_estabelecimento, id_produto, data_hora_extracao, preco_extraido, data_emissao_nfe, 
    link_comprovante_nfe, status_validacao, alerta_outlier, motivo_alerta, raw_payload, created_at
)
SELECT 
    te.id_estabelecimento,
    tp.id_produto,
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
JOIN estabelecimentos e ON e.id = pc.estabelecimento_id
JOIN tb_estabelecimento te ON te.codigo_externo = e.codigo_planilha
JOIN produtos_catalogo p ON p.id = pc.produto_id
JOIN tb_produto_dieese tp ON tp.codigo_dieese = p.codigo_produto
WHERE pc.preco_final_coletado IS NOT NULL;

-- 5. Migração de Validações Humanas Anteriores
INSERT INTO tb_validacao_critica (
    id_coleta, id_usuario_validador, data_hora_validacao, decisao, preco_final_validado, observacoes
)
SELECT 
    ca.id_coleta,
    COALESCE((SELECT id_usuario FROM tb_usuario WHERE papel = 'VALIDADOR' LIMIT 1), 1),
    COALESCE(pc.conferido_em, NOW()),
    'APROVADO',
    pc.preco_final_coletado,
    pc.observacao_conferencia
FROM precos_coletados pc
JOIN estabelecimentos e ON e.id = pc.estabelecimento_id
JOIN tb_estabelecimento te ON te.codigo_externo = e.codigo_planilha
JOIN produtos_catalogo p ON p.id = pc.produto_id
JOIN tb_produto_dieese tp ON tp.codigo_dieese = p.codigo_produto
JOIN tb_coleta_automatizada ca ON ca.id_estabelecimento = te.id_estabelecimento AND ca.id_produto = tp.id_produto
WHERE pc.status_conferencia = 'CONFERIDO' AND pc.preco_final_coletado IS NOT NULL;

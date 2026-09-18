-- ==============================================================================
-- SCRIPT DE LIMPEZA DEFINITIVA DE TABELAS LEGADAS
-- Executado após migração confirmada para tb_*
-- ==============================================================================

-- 1. Garantir que os dados mínimos estejam na nova base antes de apagar
INSERT INTO tb_estabelecimento (id_estabelecimento, codigo_externo, nome, cnpj, bairro, municipio, uf, endereco, lat_long, status_ativo)
SELECT 
    e.id, e.codigo_planilha, e.nome, e.cnpj, e.bairro, 
    COALESCE(e.municipio, 'Vitória da Conquista'), COALESCE(e.uf, 'BA'), 
    COALESCE(e.endereco_completo, e.endereco, ''),
    CASE WHEN e.latitude IS NOT NULL THEN CONCAT(e.latitude, ',', e.longitude) ELSE NULL END,
    COALESCE(e.ativo, TRUE)
FROM estabelecimentos e
ON CONFLICT (id_estabelecimento) DO NOTHING;

INSERT INTO tb_produto_dieese (id_produto, codigo_dieese, descricao_item, codigo_barras, unidade_medida, categoria, regra_calculo, status_ativo)
SELECT 
    p.id, p.codigo_produto, COALESCE(p.marca_especificacao, p.item_cesta, p.codigo_produto),
    p.gtin, COALESCE(p.unidade_medida, 'UN'), p.categoria, COALESCE(p.regra_calculo, 'PADRAO'), COALESCE(p.ativo, TRUE)
FROM produtos_catalogo p
ON CONFLICT (id_produto) DO NOTHING;

-- 2. Remoção das tabelas legadas obsoletas
DROP TABLE IF EXISTS precos_coletados CASCADE;
DROP TABLE IF EXISTS coletas_lote CASCADE;
DROP TABLE IF EXISTS historico_execucoes CASCADE;
DROP TABLE IF EXISTS historico_medias CASCADE;
DROP TABLE IF EXISTS produtos_catalogo CASCADE;
DROP TABLE IF EXISTS estabelecimentos CASCADE;

-- 3. Atualização das sequences
SELECT setval('tb_estabelecimento_id_estabelecimento_seq', COALESCE((SELECT MAX(id_estabelecimento) FROM tb_estabelecimento), 1));
SELECT setval('tb_produto_dieese_id_produto_seq', COALESCE((SELECT MAX(id_produto) FROM tb_produto_dieese), 1));
SELECT setval('tb_coleta_automatizada_id_coleta_seq', COALESCE((SELECT MAX(id_coleta) FROM tb_coleta_automatizada), 1));
SELECT setval('tb_validacao_critica_id_validacao_seq', COALESCE((SELECT MAX(id_validacao) FROM tb_validacao_critica), 1));

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import { PrecoDaHoraCollector, isCupomValidoDoDia } from './collector.js';
import { runSpreadsheetImport } from './import-full-spreadsheet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve('public')));

// Estado global de coleta em background
let coletaAtiva = {
  emExecucao: false,
  loteId: null,
  progresso: 0,
  total: 0,
  atual: 0,
  itemAtual: '',
  logs: []
};

function addLog(msg) {
  const time = new Date().toLocaleTimeString('pt-BR');
  const entry = `[${time}] ${msg}`;
  coletaAtiva.logs.unshift(entry);
  if (coletaAtiva.logs.length > 50) coletaAtiva.logs.pop();
  console.log(entry);
}

// ==================== 1. STATUS GERAL DO SISTEMA ====================
app.get('/api/status', async (req, res) => {
  try {
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM tb_estabelecimento WHERE status_ativo = TRUE) as total_estabelecimentos,
        (SELECT COUNT(*) FROM tb_estabelecimento WHERE status_ativo = TRUE AND cnpj IS NOT NULL) as total_estabelecimentos_com_cnpj,
        (SELECT COUNT(*) FROM tb_produto_dieese WHERE status_ativo = TRUE) as total_produtos,
        (SELECT COUNT(*) FROM tb_coleta_automatizada WHERE preco_extraido IS NOT NULL AND preco_extraido > 0) as total_precos_coletados,
        (SELECT COUNT(*) FROM tb_coleta_automatizada WHERE preco_extraido IS NOT NULL AND preco_extraido > 0 AND DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE) as total_precos_hoje,
        (SELECT COUNT(*) FROM tb_produto_dieese p WHERE p.status_ativo = TRUE AND p.id_produto NOT IN (
          SELECT DISTINCT id_produto FROM tb_coleta_automatizada 
          WHERE DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
          AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
          AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
          AND preco_extraido IS NOT NULL
        )) as total_pendentes_hoje,
        (SELECT COUNT(*) FROM tb_validacao_critica WHERE decisao = 'APROVADO') as total_conferidos,
        (SELECT COUNT(*) FROM tb_coleta_automatizada WHERE alerta_outlier = TRUE) as total_alertas_outliers,
        (SELECT COUNT(*) FROM tb_produto_dieese WHERE status_ativo = TRUE) as total_medias_historicas,
        (SELECT MAX(data_hora_extracao) FROM tb_coleta_automatizada WHERE preco_extraido IS NOT NULL) as ultima_coleta_data
    `);

    res.json({
      success: true,
      data: counts.rows[0],
      coletaAtiva
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 2. CATÁLOGO DE PRODUTOS DIEESE (tb_produto_dieese) ====================
// Listar produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const { categoria, busca, ativo } = req.query;
    let sql = `
      SELECT 
        id_produto AS id,
        id_produto,
        codigo_dieese AS codigo_produto,
        codigo_dieese,
        descricao_item AS marca_especificacao,
        descricao_item AS item_cesta,
        descricao_item,
        codigo_barras AS gtin,
        codigo_barras,
        unidade_medida,
        categoria,
        regra_calculo,
        status_ativo AS ativo,
        status_ativo
      FROM tb_produto_dieese 
      WHERE 1=1
    `;
    const params = [];

    if (ativo !== undefined) {
      params.push(ativo === 'true');
      sql += ` AND status_ativo = $${params.length}`;
    } else {
      sql += ' AND status_ativo = TRUE';
    }

    if (categoria) {
      params.push(categoria);
      sql += ` AND categoria = $${params.length}`;
    }

    if (busca) {
      params.push(`%${busca.toLowerCase()}%`);
      sql += ` AND (LOWER(descricao_item) LIKE $${params.length} OR LOWER(codigo_dieese) LIKE $${params.length} OR codigo_barras LIKE $${params.length})`;
    }

    sql += ' ORDER BY codigo_dieese ASC, id_produto ASC';
    const result = await pool.query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar produto
app.post('/api/produtos', async (req, res) => {
  try {
    const { codigo_produto, codigo_dieese, categoria, item_cesta, marca_especificacao, descricao_item, gtin, codigo_barras, unidade_medida, regra_calculo } = req.body;

    const cod = codigo_dieese || codigo_produto;
    const desc = descricao_item || marca_especificacao || item_cesta;
    const gtinVal = codigo_barras || gtin || null;

    if (!cod || !desc) {
      return res.status(400).json({ success: false, message: 'Código DIEESE e descrição do item são obrigatórios.' });
    }

    const result = await pool.query(`
      INSERT INTO tb_produto_dieese (
        codigo_dieese, descricao_item, codigo_barras, unidade_medida, categoria, regra_calculo, status_ativo
      ) VALUES ($1, $2, $3, $4, $5, $6, TRUE)
      RETURNING 
        id_produto AS id,
        id_produto,
        codigo_dieese AS codigo_produto,
        codigo_dieese,
        descricao_item AS marca_especificacao,
        descricao_item,
        codigo_barras AS gtin,
        unidade_medida,
        categoria,
        regra_calculo,
        status_ativo AS ativo
    `, [
      cod,
      desc,
      gtinVal,
      unidade_medida || 'UN',
      categoria || 'Geral',
      regra_calculo || 'PADRAO'
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Atualizar produto
app.put('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo_produto, codigo_dieese, categoria, item_cesta, marca_especificacao, descricao_item, gtin, codigo_barras, unidade_medida, regra_calculo, ativo } = req.body;

    const cod = codigo_dieese || codigo_produto;
    const desc = descricao_item || marca_especificacao || item_cesta;
    const gtinVal = codigo_barras || gtin;

    const result = await pool.query(`
      UPDATE tb_produto_dieese SET
        codigo_dieese = COALESCE($1, codigo_dieese),
        descricao_item = COALESCE($2, descricao_item),
        codigo_barras = $3,
        unidade_medida = COALESCE($4, unidade_medida),
        categoria = COALESCE($5, categoria),
        regra_calculo = COALESCE($6, regra_calculo),
        status_ativo = COALESCE($7, status_ativo)
      WHERE id_produto = $8
      RETURNING 
        id_produto AS id,
        id_produto,
        codigo_dieese AS codigo_produto,
        codigo_dieese,
        descricao_item AS marca_especificacao,
        descricao_item,
        codigo_barras AS gtin,
        unidade_medida,
        categoria,
        regra_calculo,
        status_ativo AS ativo
    `, [
      cod,
      desc,
      gtinVal !== undefined ? gtinVal : null,
      unidade_medida,
      categoria,
      regra_calculo,
      ativo,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deletar / Desativar produto
app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE tb_produto_dieese SET status_ativo = FALSE WHERE id_produto = $1', [id]);
    res.json({ success: true, message: 'Produto desativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 3. CADASTRO DE ESTABELECIMENTOS (tb_estabelecimento) ====================
// Listar estabelecimentos
app.get('/api/estabelecimentos', async (req, res) => {
  try {
    const { semana, busca, ativo } = req.query;
    let sql = `
      SELECT 
        id_estabelecimento AS id,
        id_estabelecimento,
        codigo_estabelecimento,
        codigo_estabelecimento AS codigo_mercado,
        codigo_externo AS codigo_planilha,
        codigo_externo,
        nome,
        bairro,
        municipio,
        uf,
        cnpj,
        endereco,
        endereco AS endereco_completo,
        lat_long,
        status_ativo AS ativo,
        status_ativo
      FROM tb_estabelecimento 
      WHERE 1=1
    `;
    const params = [];

    if (ativo !== undefined) {
      params.push(ativo === 'true');
      sql += ` AND status_ativo = $${params.length}`;
    } else {
      sql += ' AND status_ativo = TRUE';
    }

    if (busca) {
      params.push(`%${busca.toLowerCase()}%`);
      sql += ` AND (LOWER(nome) LIKE $${params.length} OR LOWER(bairro) LIKE $${params.length} OR cnpj LIKE $${params.length} OR LOWER(codigo_estabelecimento) LIKE $${params.length} OR LOWER(codigo_externo) LIKE $${params.length})`;
    }

    sql += ` ORDER BY COALESCE(NULLIF(regexp_replace(codigo_estabelecimento, '\\D', '', 'g'), '')::int, id_estabelecimento) ASC, id_estabelecimento ASC`;
    const result = await pool.query(sql, params);
    res.json({ success: true, total: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar estabelecimento
app.post('/api/estabelecimentos', async (req, res) => {
  try {
    const { codigo_planilha, codigo_externo, nome, bairro, municipio, uf, cnpj, endereco, endereco_completo, lat_long } = req.body;
    const cod = codigo_externo || codigo_planilha;
    const end = endereco || endereco_completo || '';

    if (!cod || !nome) {
      return res.status(400).json({ success: false, message: 'Código externo e nome são obrigatórios.' });
    }

    const result = await pool.query(`
      INSERT INTO tb_estabelecimento (
        codigo_externo, nome, bairro, municipio, uf, cnpj, endereco, lat_long, status_ativo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING 
        id_estabelecimento AS id,
        id_estabelecimento,
        codigo_externo AS codigo_planilha,
        codigo_externo,
        nome,
        bairro,
        municipio,
        uf,
        cnpj,
        endereco,
        endereco AS endereco_completo,
        lat_long,
        status_ativo AS ativo
    `, [
      cod,
      nome,
      bairro || null,
      municipio || 'Vitória da Conquista',
      uf || 'BA',
      cnpj ? String(cnpj).replace(/\D/g, '') : null,
      end,
      lat_long || null
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Atualizar estabelecimento
app.put('/api/estabelecimentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo_planilha, codigo_externo, nome, bairro, municipio, uf, cnpj, endereco, endereco_completo, lat_long, ativo } = req.body;
    const cod = codigo_externo || codigo_planilha;
    const end = endereco || endereco_completo;

    const result = await pool.query(`
      UPDATE tb_estabelecimento SET
        codigo_externo = COALESCE($1, codigo_externo),
        nome = COALESCE($2, nome),
        bairro = COALESCE($3, bairro),
        municipio = COALESCE($4, municipio),
        uf = COALESCE($5, uf),
        cnpj = $6,
        endereco = COALESCE($7, endereco),
        lat_long = COALESCE($8, lat_long),
        status_ativo = COALESCE($9, status_ativo),
        updated_at = NOW()
      WHERE id_estabelecimento = $10
      RETURNING 
        id_estabelecimento AS id,
        id_estabelecimento,
        codigo_externo AS codigo_planilha,
        codigo_externo,
        nome,
        bairro,
        municipio,
        uf,
        cnpj,
        endereco,
        endereco AS endereco_completo,
        lat_long,
        status_ativo AS ativo
    `, [
      cod,
      nome,
      bairro,
      municipio,
      uf,
      cnpj ? String(cnpj).replace(/\D/g, '') : null,
      end,
      lat_long,
      ativo,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Estabelecimento não encontrado.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deletar / Desativar estabelecimento
app.delete('/api/estabelecimentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE tb_estabelecimento SET status_ativo = FALSE WHERE id_estabelecimento = $1', [id]);
    res.json({ success: true, message: 'Estabelecimento desativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 4. MATRIZ CONSOLIDADA DIEESE (tb_coleta_automatizada + tb_validacao_critica) ====================
app.get('/api/matriz', async (req, res) => {
  try {
    const { categoria, mercado, dataColeta, dataNfe } = req.query;

    // 1. Mercados
    let estabSql = `
      SELECT 
        id_estabelecimento AS id,
        codigo_externo AS codigo_planilha,
        nome, bairro, municipio, cnpj, 
        COALESCE(endereco, '') AS endereco_completo,
        COALESCE(endereco, '') AS endereco,
        1 AS semana_coleta,
        'Segunda-feira' AS dia_semana
      FROM tb_estabelecimento 
      WHERE status_ativo = TRUE
    `;
    const estabParams = [];
    if (mercado) {
      estabParams.push(mercado);
      estabSql += ` AND (codigo_externo = $${estabParams.length} OR id_estabelecimento::text = $${estabParams.length})`;
    }
    estabSql += ' ORDER BY id_estabelecimento ASC';
    const estabs = (await pool.query(estabSql, estabParams)).rows;

    // 2. Produtos
    let prodSql = `
      SELECT 
        p.id_produto AS id,
        p.codigo_dieese AS codigo_produto,
        p.categoria,
        p.descricao_item AS item_cesta,
        p.descricao_item AS marca_especificacao,
        p.codigo_barras AS gtin,
        p.regra_calculo,
        NULL AS media_anterior
      FROM tb_produto_dieese p
      WHERE p.status_ativo = TRUE
    `;
    const prodParams = [];
    if (categoria) {
      prodParams.push(categoria);
      prodSql += ` AND p.categoria = $${prodParams.length}`;
    }
    prodSql += ' ORDER BY p.codigo_dieese ASC, p.id_produto ASC';
    const produtos = (await pool.query(prodSql, prodParams)).rows;

    // 3. Preços mais recentes de cada par (produto, estabelecimento)
    let precosSql = `
      SELECT 
        ca.id_coleta AS id,
        ca.id_estabelecimento AS estabelecimento_id,
        ca.id_produto AS produto_id,
        COALESCE(vc.preco_final_validado, ca.preco_extraido) AS preco_final_coletado,
        ca.preco_extraido AS preco_bruto_nfe,
        ca.preco_extraido AS preco_liquido_nfe,
        ca.alerta_outlier,
        ca.motivo_alerta,
        COALESCE(vc.decisao, ca.status_validacao) AS status_conferencia,
        u.nome AS conferido_por,
        vc.data_hora_validacao AS conferido_em,
        vc.observacoes AS observacao_conferencia,
        ca.data_hora_extracao AS data_coleta,
        ca.data_emissao_nfe,
        ca.link_comprovante_nfe
      FROM tb_coleta_automatizada ca
      LEFT JOIN tb_validacao_critica vc ON vc.id_coleta = ca.id_coleta
      LEFT JOIN tb_usuario u ON u.id_usuario = vc.id_usuario_validador
      WHERE 1=1
    `;
    const precosParams = [];
    if (dataColeta) {
      precosParams.push(dataColeta);
      precosSql += ` AND DATE(ca.data_hora_extracao) = $${precosParams.length}::date`;
    }
    if (dataNfe) {
      precosParams.push(dataNfe);
      precosSql += ` AND DATE(ca.data_emissao_nfe) = $${precosParams.length}::date`;
    }

    const precosRes = await pool.query(precosSql, precosParams);

    const precosMap = {};
    for (const row of precosRes.rows) {
      const key = `${row.produto_id}_${row.estabelecimento_id}`;
      precosMap[key] = row;
    }

    res.json({
      success: true,
      data: {
        estabelecimentos: estabs,
        produtos,
        precosMap
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Descartar / Excluir Preço
app.delete('/api/precos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tb_coleta_automatizada WHERE id_coleta = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Preço não encontrado.' });
    }
    res.json({ success: true, message: 'Preço descartado e removido com sucesso!', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Detalhes de Auditoria
app.get('/api/precos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        ca.id_coleta AS id,
        ca.id_estabelecimento AS estabelecimento_id,
        ca.id_produto AS produto_id,
        ca.preco_extraido AS preco_final_coletado,
        ca.preco_extraido AS preco_bruto_nfe,
        ca.data_emissao_nfe,
        ca.data_hora_extracao AS data_coleta,
        ca.link_comprovante_nfe,
        ca.status_validacao AS status_conferencia,
        ca.alerta_outlier,
        ca.motivo_alerta,
        ca.raw_payload,
        e.codigo_externo AS mercado_codigo,
        e.nome AS mercado_nome,
        e.bairro AS mercado_bairro,
        p.descricao_item AS item_cesta,
        p.descricao_item AS marca_especificacao,
        p.codigo_dieese AS codigo_produto,
        p.categoria,
        vc.decisao,
        vc.preco_final_validado,
        vc.observacoes AS observacao_conferencia,
        vc.data_hora_validacao AS conferido_em,
        u.nome AS conferido_por
      FROM tb_coleta_automatizada ca
      JOIN tb_estabelecimento e ON e.id_estabelecimento = ca.id_estabelecimento
      JOIN tb_produto_dieese p ON p.id_produto = ca.id_produto
      LEFT JOIN tb_validacao_critica vc ON vc.id_coleta = ca.id_coleta
      LEFT JOIN tb_usuario u ON u.id_usuario = vc.id_usuario_validador
      WHERE ca.id_coleta = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Conferência e Crítica Humana (grava em tb_validacao_critica e atualiza tb_coleta_automatizada)
app.post('/api/precos/:id/critica', async (req, res) => {
  try {
    const { id } = req.params;
    const { precoAjustado, statusConferencia = 'CONFERIDO', conferidoPor = 'Crítico DIEESE', observacao } = req.body;

    // 1. Busca preço original
    const precoOriginalRes = await pool.query('SELECT preco_extraido FROM tb_coleta_automatizada WHERE id_coleta = $1', [id]);
    if (precoOriginalRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro de coleta não encontrado.' });
    }
    const precoOriginal = Number(precoOriginalRes.rows[0].preco_extraido);
    const precoFinal = precoAjustado !== undefined && precoAjustado !== null && !isNaN(precoAjustado)
      ? Number(precoAjustado)
      : precoOriginal;

    const decisao = precoAjustado !== undefined && Number(precoAjustado) !== precoOriginal
      ? 'CORRIGIDO_MANUALMENTE'
      : (statusConferencia === 'REJEITADO' ? 'REJEITADO' : 'APROVADO');

    // 2. Grava ou atualiza em tb_validacao_critica
    const valResult = await pool.query(`
      INSERT INTO tb_validacao_critica (
        id_coleta, id_usuario_validador, data_hora_validacao, decisao, preco_final_validado, observacoes
      ) VALUES ($1, 2, NOW(), $2, $3, $4)
      RETURNING *
    `, [id, decisao, precoFinal, observacao || null]);

    // 3. Atualiza status na tb_coleta_automatizada
    const novoStatus = decisao === 'REJEITADO' ? 'REJEITADO' : 'VALIDADO';
    await pool.query(`
      UPDATE tb_coleta_automatizada
      SET status_validacao = $1,
          alerta_outlier = FALSE
      WHERE id_coleta = $2
    `, [novoStatus, id]);

    res.json({
      success: true,
      message: 'Validação crítica registrada com sucesso!',
      data: {
        id: Number(id),
        preco_final_coletado: precoFinal,
        status_conferencia: decisao,
        conferido_por: conferidoPor,
        conferido_em: new Date(),
        observacao_conferencia: observacao
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 5. MOTOR DA AUTOMAÇÃO EM SEGUNDO PLANO ====================
app.post('/api/coleta/iniciar', async (req, res) => {
  if (coletaAtiva.emExecucao) {
    return res.status(400).json({ success: false, message: 'Uma coleta já está em andamento.' });
  }

  const { limite, categoria, apenasPendentes = false, rodada = 1, minDelayMs = 2500, maxDelayMs = 4000 } = req.body;

  coletaAtiva = {
    emExecucao: true,
    loteId: 1,
    progresso: 0,
    total: 0,
    atual: 0,
    itemAtual: 'Iniciando pipeline resiliente do dia (05h às 21h)...',
    logs: []
  };

  res.json({ 
    success: true, 
    message: `Coleta (Rodada ${rodada}) iniciada em background! ${apenasPendentes ? 'Modo: apenas itens pendentes de hoje.' : 'Modo: varredura completa.'}` 
  });

  (async () => {
    try {
      addLog(`🚀 Coleta iniciada (Rodada: ${rodada}, Modo: ${apenasPendentes ? 'Apenas Pendentes de Hoje' : 'Completa'})`);

      const collector = new PrecoDaHoraCollector({
        municipio: 'vitoria da conquista',
        minDelayMs: Number(minDelayMs),
        maxDelayMs: Number(maxDelayMs)
      });
      const configAtiva = await collector.carregarConfiguracao();
      const ntfyUrl = configAtiva?.ntfy_topico_url || 'https://ntfy.sh/pdh-auto2026';

      // 1. Mercados Ativos
      const estabsRes = await pool.query('SELECT id_estabelecimento, codigo_externo, nome, bairro, cnpj FROM tb_estabelecimento WHERE status_ativo = TRUE');
      const estabelecimentos = estabsRes.rows;

      // 2. Produtos
      let prodSql = `
        SELECT p.id_produto, p.codigo_dieese, p.descricao_item, p.codigo_barras, p.regra_calculo, p.categoria
        FROM tb_produto_dieese p
        WHERE p.status_ativo = TRUE
      `;
      const prodParams = [];

      if (apenasPendentes) {
        prodSql += `
          AND p.id_produto NOT IN (
            SELECT DISTINCT id_produto 
            FROM tb_coleta_automatizada 
            WHERE DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
            AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
            AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
            AND preco_extraido IS NOT NULL
          )
        `;
      }

      if (categoria) {
        prodParams.push(categoria);
        prodSql += ` AND p.categoria = $${prodParams.length}`;
      }
      prodSql += ' ORDER BY p.codigo_dieese ASC, p.id_produto ASC';
      if (limite) {
        prodParams.push(Number(limite));
        prodSql += ` LIMIT $${prodParams.length}`;
      }
      const produtos = (await pool.query(prodSql, prodParams)).rows;

      coletaAtiva.total = produtos.length;
      addLog(`📋 ${produtos.length} produtos e ${estabelecimentos.length} mercados selecionados para a rodada ${rodada}.`);

      // Notificação de início
      if (configAtiva?.notificar_ao_iniciar !== false) {
        try {
          await fetch(ntfyUrl, {
            method: 'POST',
            headers: {
              'Title': `DIEESE - Coleta Diária Iniciada (Rodada ${rodada})`,
              'Priority': 'default',
              'Tags': 'hourglass_flowing_sand,shopping_cart'
            },
            body: `🚀 Coleta DIEESE iniciada às ${new Date().toLocaleTimeString('pt-BR')}!\n🎯 Regra: Cupons emitidos HOJE entre 05:00 e 21:00\n📦 Produtos nesta rodada: ${produtos.length}\n🏪 Mercados ativos: ${estabelecimentos.length}\n${apenasPendentes ? '🔄 Foco: Apenas itens ainda sem venda hoje.' : '📋 Foco: Varredura geral.'}`
          });
          addLog(`📱 Notificação de início disparada para ${ntfyUrl}`);
        } catch (e) {}
      }

      const inicioTimestamp = Date.now();
      let totalEncontrados = 0;
      let totalNaoEncontrados = 0;
      let totalAlertas = 0;

      for (let i = 0; i < produtos.length; i++) {
        const prod = produtos[i];
        coletaAtiva.atual = i + 1;
        coletaAtiva.progresso = Math.round(((i + 1) / produtos.length) * 100);
        coletaAtiva.itemAtual = `${prod.descricao_item} (${i + 1}/${produtos.length})`;

        addLog(`🔍 [${i + 1}/${produtos.length}] Consultando: ${prod.descricao_item}...`);

        let ofertas = [];
        try {
          if (prod.codigo_barras) {
            ofertas = await collector.buscarPorGtinComRetry(prod.codigo_barras);
          } else {
            ofertas = await collector.buscarPorTermoComRetry(prod.descricao_item);
          }
        } catch (err) {
          addLog(`⚠️ Erro ao consultar ${prod.descricao_item}: ${err.message}`);
          continue;
        }

        const mercadosComOferta = new Set();

        for (const oferta of ofertas) {
          const dataNfeRaw = oferta.produto?.data;
          const ehDoDiaValido = collector.validarCupomDoDia(dataNfeRaw);

          if (!ehDoDiaValido) continue;

          const matchedEstab = collector.matchEstabelecimento(oferta, estabelecimentos);

          if (matchedEstab) {
            mercadosComOferta.add(matchedEstab.id_estabelecimento);
            const idColetaSalva = await collector.salvarPreco({
              estabelecimentoId: matchedEstab.id_estabelecimento,
              produtoId: prod.id_produto,
              oferta,
              regraCalculo: prod.regra_calculo,
              mediaAnterior: null
            });
            totalEncontrados++;
            addLog(`   🎯 Salvo (Hoje): ${matchedEstab.codigo_externo} (${matchedEstab.nome}) - R$ ${oferta.produto.precoBruto ?? oferta.produto.precoUnitario}`);
          }
        }

        // Para estabelecimentos sem venda registrada hoje
        for (const estab of estabelecimentos) {
          if (!mercadosComOferta.has(estab.id_estabelecimento)) {
            totalNaoEncontrados++;
            await pool.query(`
              INSERT INTO tb_coleta_automatizada (
                id_estabelecimento, id_produto, data_hora_extracao, status_validacao
              ) VALUES ($1, $2, NOW(), 'NAO_ENCONTRADO');
            `, [estab.id_estabelecimento, prod.id_produto]);
          }
        }

        await collector.esperarIntervaloSeguro();
      }

      const duracaoSegundos = Number(((Date.now() - inicioTimestamp) / 1000).toFixed(1));
      addLog(`🏁 Rodada ${rodada} concluída em ${duracaoSegundos}s! Encontrados: ${totalEncontrados}, Pendentes: ${totalNaoEncontrados}`);

      // Registrar histórico de execução em tb_historico_execucoes
      try {
        await pool.query(`
          INSERT INTO tb_historico_execucoes (
            semana_coleta, total_buscas, total_encontrados, total_nao_encontrados,
            total_alertas, duracao_segundos, status, mensagem_resumo, logs
          ) VALUES (
            1, $1, $2, $3, $4, $5, 'CONCLUIDO', $6, $7
          )
        `, [
          produtos.length,
          totalEncontrados,
          totalNaoEncontrados,
          totalAlertas,
          duracaoSegundos,
          `Rodada ${rodada} concluída: ${totalEncontrados} preços capturados no dia.`,
          JSON.stringify(coletaAtiva.logs.slice(0, 50))
        ]);
      } catch (logErr) {
        console.error('Aviso ao registrar tb_historico_execucoes:', logErr.message);
      }

      // Notificação de encerramento
      if (configAtiva?.notificar_ao_concluir !== false) {
        try {
          await fetch(ntfyUrl, {
            method: 'POST',
            headers: {
              'Title': `DIEESE - Relatório da Rodada ${rodada}`,
              'Priority': 'default',
              'Tags': 'white_check_mark,bar_chart'
            },
            body: `✅ Rodada ${rodada} finalizada em ${duracaoSegundos}s!\n🎯 Preços com nota de hoje: ${totalEncontrados}\n⏳ Produtos aguardando venda: ${totalNaoEncontrados}\n🔗 Painel: https://precodahora.dmi89h.easypanel.host/`
          });
          addLog(`📱 Notificação de encerramento disparada para ${ntfyUrl}`);
        } catch (e) {}
      }

    } catch (error) {
      addLog(`❌ Falha crítica na coleta: ${error.message}`);
    } finally {
      coletaAtiva.emExecucao = false;
      coletaAtiva.itemAtual = 'Concluído';
    }
  })();
});

// Status do Progresso da Coleta
app.get('/api/coleta/progresso', (req, res) => {
  res.json({ success: true, data: coletaAtiva });
});

// Relatório consolidado de cobertura do dia
app.get('/api/relatorio-diario', async (req, res) => {
  try {
    const totalProdRes = await pool.query('SELECT COUNT(*) FROM tb_produto_dieese WHERE status_ativo = TRUE');
    const totalProdutos = Number(totalProdRes.rows[0].count);

    const pendRes = await pool.query(`
      SELECT p.id_produto AS id, p.codigo_dieese AS codigo_produto, p.categoria, p.descricao_item AS item_cesta, p.descricao_item AS marca_especificacao
      FROM tb_produto_dieese p
      WHERE p.status_ativo = TRUE
      AND p.id_produto NOT IN (
        SELECT DISTINCT id_produto 
        FROM tb_coleta_automatizada 
        WHERE DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
        AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
        AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
        AND preco_extraido IS NOT NULL
      )
      ORDER BY p.codigo_dieese ASC
    `);

    const concluidosRes = await pool.query(`
      SELECT DISTINCT p.id_produto AS id, p.codigo_dieese AS codigo_produto, p.descricao_item AS item_cesta, p.descricao_item AS marca_especificacao
      FROM tb_produto_dieese p
      JOIN tb_coleta_automatizada ca ON ca.id_produto = p.id_produto
      WHERE p.status_ativo = TRUE
      AND DATE(ca.data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
      AND EXTRACT(HOUR FROM ca.data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
      AND EXTRACT(HOUR FROM ca.data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
      AND ca.preco_extraido IS NOT NULL
      ORDER BY p.codigo_dieese ASC
    `);

    res.json({
      success: true,
      data: {
        total_produtos: totalProdutos,
        total_concluidos_hoje: concluidosRes.rows.length,
        total_pendentes_hoje: pendRes.rows.length,
        percentual_cobertura_hoje: totalProdutos > 0 ? Number(((concluidosRes.rows.length / totalProdutos) * 100).toFixed(1)) : 0,
        pendentes_hoje: pendRes.rows,
        concluidos_hoje: concluidosRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Histórico de Execuções (tb_historico_execucoes)
app.get('/api/execucoes', async (req, res) => {
  try {
    const runs = await pool.query(`
      SELECT 
        id_execucao AS id,
        semana_coleta,
        mercado_codigo,
        total_buscas,
        total_encontrados,
        total_nao_encontrados,
        total_alertas,
        duracao_segundos,
        status,
        mensagem_resumo,
        logs,
        created_at
      FROM tb_historico_execucoes 
      ORDER BY id_execucao DESC 
      LIMIT 30
    `);
    const hoje = await pool.query(`
      SELECT 
        COUNT(*) as total_lotes_hoje,
        COALESCE(SUM(total_buscas), 0) as total_buscas_hoje,
        COALESCE(SUM(total_encontrados), 0) as total_encontrados_hoje,
        COALESCE(SUM(total_nao_encontrados), 0) as total_nao_encontrados_hoje,
        COALESCE(SUM(total_alertas), 0) as total_alertas_hoje
      FROM tb_historico_execucoes
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    res.json({
      success: true,
      data: {
        runs: runs.rows,
        resumoHoje: hoje.rows[0]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para notificação manual/webhook ntfy
app.post('/api/notificar-ntfy', async (req, res) => {
  try {
    const { titulo, mensagem, tags = 'white_check_mark,robot' } = req.body;
    const configRes = await pool.query('SELECT ntfy_topico_url FROM tb_configuracao_automacao WHERE ativo = TRUE LIMIT 1');
    const ntfyUrl = configRes.rows[0]?.ntfy_topico_url || 'https://ntfy.sh/pdh-auto2026';

    const response = await fetch(ntfyUrl, {
      method: 'POST',
      headers: {
        'Title': titulo || 'Preço da Hora DIEESE',
        'Priority': 'default',
        'Tags': tags
      },
      body: mensagem || 'Notificação do Sistema Preço da Hora'
    });
    const text = await response.text();
    res.json({ success: true, result: text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 6. ENDPOINTS SCHEMA V2 (OFICIAIS) ====================

// Listar produtos do catálogo oficial (tb_produto_dieese)
app.get('/api/v2/produtos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tb_produto_dieese 
      WHERE status_ativo = TRUE 
      ORDER BY codigo_dieese ASC, id_produto ASC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Listar estabelecimentos / mercados (tb_estabelecimento)
app.get('/api/v2/estabelecimentos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tb_estabelecimento 
      WHERE status_ativo = TRUE 
      ORDER BY codigo_externo ASC, id_estabelecimento ASC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Listar coletas pendentes de validação para o humano (tb_coleta_automatizada)
app.get('/api/v2/coletas-pendentes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ca.id_coleta,
        ca.id_estabelecimento,
        ca.id_produto,
        ca.data_hora_extracao,
        ca.preco_extraido,
        ca.data_emissao_nfe,
        ca.link_comprovante_nfe,
        ca.status_validacao,
        ca.alerta_outlier,
        ca.motivo_alerta,
        p.codigo_dieese,
        p.descricao_item,
        p.categoria,
        p.unidade_medida,
        e.codigo_externo AS mercado_codigo,
        e.nome AS mercado_nome,
        e.cnpj AS mercado_cnpj,
        e.bairro AS mercado_bairro
      FROM tb_coleta_automatizada ca
      JOIN tb_produto_dieese p ON p.id_produto = ca.id_produto
      JOIN tb_estabelecimento e ON e.id_estabelecimento = ca.id_estabelecimento
      WHERE ca.status_validacao = 'PENDENTE'
      ORDER BY ca.alerta_outlier DESC, ca.data_hora_extracao DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Registrar validação / crítica humana (tb_validacao_critica)
app.post('/api/v2/validar', async (req, res) => {
  try {
    const { id_coleta, id_usuario_validador = 2, decisao, preco_final_validado, motivo_rejeicao, observacoes } = req.body;

    if (!id_coleta || !decisao || preco_final_validado === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'id_coleta, decisao (APROVADO, REJEITADO, CORRIGIDO_MANUALMENTE) e preco_final_validado são obrigatórios.' 
      });
    }

    const resultVal = await pool.query(`
      INSERT INTO tb_validacao_critica (
        id_coleta, id_usuario_validador, data_hora_validacao, decisao, preco_final_validado, motivo_rejeicao, observacoes
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6)
      RETURNING *
    `, [id_coleta, id_usuario_validador, decisao, preco_final_validado, motivo_rejeicao || null, observacoes || null]);

    const novoStatus = decisao === 'REJEITADO' ? 'REJEITADO' : 'VALIDADO';
    await pool.query(`
      UPDATE tb_coleta_automatizada
      SET status_validacao = $1,
          alerta_outlier = FALSE
      WHERE id_coleta = $2
    `, [novoStatus, id_coleta]);

    res.json({
      success: true,
      message: 'Validação registrada com sucesso',
      data: resultVal.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Relatório Oficial DIEESE: Preços Aprovados e Validados (vw_precos_oficiais_dieese)
app.get('/api/v2/precos-oficiais', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM vw_precos_oficiais_dieese
      ORDER BY codigo_dieese ASC, codigo_mercado ASC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ingestão pelo robô / n8n / script Python (tb_coleta_automatizada)
app.post('/api/v2/coleta-robo', async (req, res) => {
  try {
    const { codigo_barras, cnpj, preco_extraido, data_emissao_nfe, link_comprovante_nfe, alerta_outlier, motivo_alerta } = req.body;

    if (!codigo_barras || !cnpj || preco_extraido === undefined) {
      return res.status(400).json({ success: false, message: 'codigo_barras, cnpj e preco_extraido são obrigatórios.' });
    }

    const cnpjLimpo = String(cnpj).replace(/\D/g, '');
    const estRes = await pool.query('SELECT id_estabelecimento FROM tb_estabelecimento WHERE cnpj LIKE $1 LIMIT 1', [`%${cnpjLimpo}%`]);
    const prodRes = await pool.query('SELECT id_produto FROM tb_produto_dieese WHERE codigo_barras = $1 LIMIT 1', [codigo_barras]);

    if (estRes.rows.length === 0 || prodRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Estabelecimento (CNPJ ${cnpj}) ou Produto (GTIN ${codigo_barras}) não localizado no cadastro base.`
      });
    }

    const idEstab = estRes.rows[0].id_estabelecimento;
    const idProd = prodRes.rows[0].id_produto;

    const result = await pool.query(`
      INSERT INTO tb_coleta_automatizada (
        id_estabelecimento, id_produto, data_hora_extracao, preco_extraido, data_emissao_nfe, link_comprovante_nfe, status_validacao, alerta_outlier, motivo_alerta
      ) VALUES ($1, $2, NOW(), $3, $4, $5, 'PENDENTE', $6, $7)
      RETURNING *
    `, [idEstab, idProd, preco_extraido, data_emissao_nfe || new Date(), link_comprovante_nfe || null, !!alerta_outlier, motivo_alerta || null]);

    res.json({ success: true, message: 'Preço registrado pelo robô com sucesso', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obter configuração ativa da automação (tb_configuracao_automacao)
app.get('/api/v2/configuracao', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tb_configuracao_automacao
      WHERE ativo = TRUE
      ORDER BY id_configuracao DESC
      LIMIT 1
    `);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Nenhuma configuração ativa encontrada.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar parâmetros da automação (tb_configuracao_automacao)
app.put('/api/v2/configuracao', async (req, res) => {
  try {
    const body = req.body;
    const current = await pool.query(`SELECT id_configuracao FROM tb_configuracao_automacao WHERE ativo = TRUE ORDER BY id_configuracao DESC LIMIT 1`);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Configuração não encontrada.' });
    }
    const idConfig = current.rows[0].id_configuracao;

    const result = await pool.query(`
      UPDATE tb_configuracao_automacao
      SET 
        hora_inicio_janela = COALESCE($1, hora_inicio_janela),
        hora_fim_janela = COALESCE($2, hora_fim_janela),
        apenas_vendas_do_dia = COALESCE($3, apenas_vendas_do_dia),
        cron_agendamento = COALESCE($4, cron_agendamento),
        tentativas_max_retry = COALESCE($5, tentativas_max_retry),
        intervalo_retry_minutos = COALESCE($6, intervalo_retry_minutos),
        raio_padrao_km = COALESCE($7, raio_padrao_km),
        ignorar_descontos_promocoes = COALESCE($8, ignorar_descontos_promocoes),
        percentual_alerta_outlier = COALESCE($9, percentual_alerta_outlier),
        notificacoes_ativas = COALESCE($10, notificacoes_ativas),
        ntfy_topico_url = COALESCE($11, ntfy_topico_url),
        parametros_extras = COALESCE($12, parametros_extras),
        updated_at = NOW()
      WHERE id_configuracao = $13
      RETURNING *
    `, [
      body.hora_inicio_janela,
      body.hora_fim_janela,
      body.apenas_vendas_do_dia,
      body.cron_agendamento,
      body.tentativas_max_retry,
      body.intervalo_retry_minutos,
      body.raio_padrao_km,
      body.ignorar_descontos_promocoes,
      body.percentual_alerta_outlier,
      body.notificacoes_ativas,
      body.ntfy_topico_url,
      body.parametros_extras ? JSON.stringify(body.parametros_extras) : null,
      idConfig
    ]);

    res.json({ success: true, message: 'Configurações de automação atualizadas com sucesso', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 7. CALENDÁRIO DE COLETAS & ESCALA DIEESE ====================
// Listar calendário com progresso em tempo real
app.get('/api/v2/calendario', async (req, res) => {
  try {
    const { semana, dia_semana, status } = req.query;
    let sql = `SELECT * FROM vw_calendario_progresso WHERE 1=1`;
    const params = [];

    if (semana) {
      params.push(parseInt(semana, 10));
      sql += ` AND semana = $${params.length}`;
    }
    if (dia_semana) {
      params.push(dia_semana);
      sql += ` AND dia_semana ILIKE $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND status_tempo_real = $${params.length}`;
    }

    sql += ` ORDER BY semana ASC, COALESCE(NULLIF(regexp_replace(codigo_estabelecimento, '\\D', '', 'g'), '')::int, id_estabelecimento) ASC`;
    const result = await pool.query(sql, params);

    const totais = {
      total_estabelecimentos: result.rows.length,
      total_esperado: result.rows.reduce((acc, r) => acc + (parseInt(r.total_esperado, 10) || 0), 0),
      total_registrado: result.rows.reduce((acc, r) => acc + (parseInt(r.qtd_registrada, 10) || 0), 0),
      total_validado: result.rows.reduce((acc, r) => acc + (parseInt(r.qtd_validada_humano, 10) || 0), 0),
      total_restante: result.rows.reduce((acc, r) => acc + (parseInt(r.qtd_restante, 10) || 0), 0)
    };

    res.json({ success: true, data: result.rows, totais });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar informações da escala no calendário
app.put('/api/v2/calendario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data_efetiva, pesquisador, critica_validador, prints_validador, status } = req.body;
    const result = await pool.query(`
      UPDATE tb_calendario_coleta
      SET 
        data_efetiva = COALESCE($1, data_efetiva),
        pesquisador = COALESCE($2, pesquisador),
        critica_validador = COALESCE($3, critica_validador),
        prints_validador = COALESCE($4, prints_validador),
        status = COALESCE($5, status),
        updated_at = NOW()
      WHERE id_calendario = $6
      RETURNING *
    `, [data_efetiva, pesquisador, critica_validador, prints_validador, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 8. RESUMOS, TOTAIS E MÉDIAS (EQUIVALENTE À ABA DIEESE) ====================
app.get('/api/v2/resumos-medias', async (req, res) => {
  try {
    const { categoria, busca, apenas_alertas, matriz } = req.query;
    let sql = `SELECT * FROM vw_resumo_totais_medias WHERE 1=1`;
    const params = [];

    if (categoria) {
      params.push(categoria);
      sql += ` AND categoria = $${params.length}`;
    }
    if (busca) {
      params.push(`%${busca.toLowerCase()}%`);
      sql += ` AND (LOWER(descricao_item) LIKE $${params.length} OR LOWER(codigo_dieese) LIKE $${params.length} OR codigo_barras LIKE $${params.length})`;
    }
    if (apenas_alertas === 'true') {
      sql += ` AND alerta_outlier_50pct = TRUE`;
    }

    sql += ` ORDER BY categoria ASC, codigo_dieese ASC, id_produto ASC`;
    const result = await pool.query(sql, params);

    // Se solicitado matriz completa por mercado M1..M40
    if (matriz === 'true') {
      const precosMercados = await pool.query(`
        SELECT 
          c.id_produto,
          e.codigo_estabelecimento,
          c.preco_extraido
        FROM tb_coleta_automatizada c
        JOIN tb_estabelecimento e ON e.id_estabelecimento = c.id_estabelecimento
        WHERE c.preco_extraido IS NOT NULL
      `);

      const mapaPrecos = {};
      for (const row of precosMercados.rows) {
        if (!mapaPrecos[row.id_produto]) mapaPrecos[row.id_produto] = {};
        mapaPrecos[row.id_produto][row.codigo_estabelecimento] = row.preco_extraido;
      }

      const dadosComMatriz = result.rows.map(item => ({
        ...item,
        precos_por_mercado: mapaPrecos[item.id_produto] || {}
      }));

      return res.json({ success: true, total: dadosComMatriz.length, data: dadosComMatriz });
    }

    res.json({ success: true, total: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Forçar importação integral da planilha oficial
app.post('/api/v2/importar-planilha', async (req, res) => {
  try {
    await runSpreadsheetImport();
    res.json({ success: true, message: 'Planilha oficial importada e sincronizada com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 9. AUTO-INICIALIZAÇÃO & MIGRAÇÃO ====================
async function autoInitDatabase() {
  try {
    console.log('⚙️ Inicializando tabelas V2/V3 e aplicando dicionário de dados...');

    const v2SchemaPath = path.resolve('database/schema_v2.sql');
    if (fs.existsSync(v2SchemaPath)) {
      const v2SchemaSql = fs.readFileSync(v2SchemaPath, 'utf8');
      await pool.query(v2SchemaSql);
      console.log('✅ Schema V2 conferido com sucesso.');
    }

    const cleanupPath = path.resolve('database/cleanup_legacy_tables.sql');
    if (fs.existsSync(cleanupPath)) {
      const cleanupSql = fs.readFileSync(cleanupPath, 'utf8');
      await pool.query(cleanupSql);
      console.log('🧹 Limpeza definitiva de tabelas legadas executada com sucesso.');
    }

    const v3SchemaPath = path.resolve('database/schema_v3.sql');
    if (fs.existsSync(v3SchemaPath)) {
      const v3SchemaSql = fs.readFileSync(v3SchemaPath, 'utf8');
      await pool.query(v3SchemaSql);
      console.log('✅ Schema V3 (Calendário e Médias) conferido com sucesso.');
    }

    // Verificar se o calendário ou produtos oficiais precisam ser carregados da planilha
    const checkCal = await pool.query('SELECT COUNT(*) FROM tb_calendario_coleta');
    const checkProd = await pool.query('SELECT COUNT(*) FROM tb_produto_dieese WHERE status_ativo = TRUE');
    if (parseInt(checkCal.rows[0].count, 10) === 0 || parseInt(checkProd.rows[0].count, 10) !== 76) {
      console.log('📋 Sincronizando catálogo e calendário com a planilha oficial...');
      await runSpreadsheetImport();
      console.log('✅ Carga da planilha concluída na inicialização.');
    }
  } catch (err) {
    console.error('⚠️ Aviso durante auto-inicialização do banco:', err.message);
  }
}

// Endpoint manual de setup / limpeza
app.post('/api/setup-db', async (req, res) => {
  try {
    await autoInitDatabase();
    await runSpreadsheetImport();

    const cEstab = await pool.query('SELECT COUNT(*) FROM tb_estabelecimento');
    const cProd = await pool.query('SELECT COUNT(*) FROM tb_produto_dieese WHERE status_ativo = TRUE');
    const cColeta = await pool.query('SELECT COUNT(*) FROM tb_coleta_automatizada');
    const cVal = await pool.query('SELECT COUNT(*) FROM tb_validacao_critica');
    const cConf = await pool.query('SELECT COUNT(*) FROM tb_configuracao_automacao');
    const cCal = await pool.query('SELECT COUNT(*) FROM tb_calendario_coleta');
    const cRef = await pool.query('SELECT COUNT(*) FROM tb_media_referencia_dieese');

    res.json({
      success: true,
      message: 'Banco 100% atualizado para Schema V3 com 76 produtos oficiais e calendário sincronizado.',
      counts: {
        tb_estabelecimento: cEstab.rows[0].count,
        tb_produto_dieese: cProd.rows[0].count,
        tb_coleta_automatizada: cColeta.rows[0].count,
        tb_validacao_critica: cVal.rows[0].count,
        tb_configuracao_automacao: cConf.rows[0].count,
        tb_calendario_coleta: cCal.rows[0].count,
        tb_media_referencia_dieese: cRef.rows[0].count
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`🌐 Servidor Preço da Hora DIEESE rodando em: http://localhost:${PORT}`);
  await autoInitDatabase();
});

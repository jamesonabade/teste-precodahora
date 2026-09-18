import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import { PrecoDaHoraCollector, isCupomValidoDoDia } from './collector.js';

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

// ==================== 1. STATUS GERAL ====================
app.get('/api/status', async (req, res) => {
  try {
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM estabelecimentos WHERE ativo = TRUE) as total_estabelecimentos,
        (SELECT COUNT(*) FROM estabelecimentos WHERE ativo = TRUE AND cnpj IS NOT NULL) as total_estabelecimentos_com_cnpj,
        (SELECT COUNT(*) FROM produtos_catalogo WHERE ativo = TRUE) as total_produtos,
        (SELECT COUNT(*) FROM precos_coletados WHERE preco_final_coletado IS NOT NULL AND preco_final_coletado > 0) as total_precos_coletados,
        (SELECT COUNT(*) FROM precos_coletados WHERE preco_final_coletado IS NOT NULL AND preco_final_coletado > 0 AND DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE) as total_precos_hoje,
        (SELECT COUNT(*) FROM produtos_catalogo pc WHERE pc.ativo = TRUE AND pc.id NOT IN (
          SELECT DISTINCT produto_id FROM precos_coletados 
          WHERE DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
          AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
          AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
          AND preco_final_coletado IS NOT NULL
        )) as total_pendentes_hoje,
        (SELECT COUNT(*) FROM precos_coletados WHERE status_conferencia = 'CONFERIDO') as total_conferidos,
        (SELECT COUNT(*) FROM precos_coletados WHERE alerta_outlier = TRUE) as total_alertas_outliers,
        (SELECT COUNT(*) FROM historico_medias) as total_medias_historicas,
        (SELECT MAX(data_coleta) FROM precos_coletados WHERE preco_final_coletado IS NOT NULL) as ultima_coleta_data
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

// ==================== 2. CRUD DE PRODUTOS ====================
// Listar produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const { categoria, busca, ativo } = req.query;
    let sql = 'SELECT * FROM produtos_catalogo WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      params.push(ativo === 'true');
      sql += ` AND ativo = $${params.length}`;
    } else {
      sql += ' AND ativo = TRUE';
    }

    if (categoria) {
      params.push(categoria);
      sql += ` AND categoria = $${params.length}`;
    }

    if (busca) {
      params.push(`%${busca.toLowerCase()}%`);
      sql += ` AND (LOWER(marca_especificacao) LIKE $${params.length} OR LOWER(item_cesta) LIKE $${params.length} OR gtin LIKE $${params.length} OR codigo_produto LIKE $${params.length})`;
    }

    sql += ' ORDER BY codigo_produto ASC, id ASC';
    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar produto
app.post('/api/produtos', async (req, res) => {
  try {
    const { codigo_produto, categoria, item_cesta, marca_especificacao, gtin, tipo_busca, termo_busca, unidade_medida, regra_calculo } = req.body;

    if (!codigo_produto || !categoria || !marca_especificacao) {
      return res.status(400).json({ success: false, message: 'Código, categoria e marca/especificação são obrigatórios.' });
    }

    const tipo = tipo_busca || (gtin && /^\d+$/.test(gtin) ? 'GTIN' : 'TERMO');
    const termo = termo_busca || (tipo === 'TERMO' ? marca_especificacao : '');

    const result = await pool.query(`
      INSERT INTO produtos_catalogo (
        codigo_produto, categoria, item_cesta, marca_especificacao, gtin, tipo_busca, termo_busca, unidade_medida, regra_calculo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      codigo_produto,
      categoria,
      item_cesta || categoria,
      marca_especificacao,
      gtin || null,
      tipo,
      termo,
      unidade_medida || 'UN',
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
    const { codigo_produto, categoria, item_cesta, marca_especificacao, gtin, tipo_busca, termo_busca, unidade_medida, regra_calculo, ativo } = req.body;

    const result = await pool.query(`
      UPDATE produtos_catalogo SET
        codigo_produto = COALESCE($1, codigo_produto),
        categoria = COALESCE($2, categoria),
        item_cesta = COALESCE($3, item_cesta),
        marca_especificacao = COALESCE($4, marca_especificacao),
        gtin = $5,
        tipo_busca = COALESCE($6, tipo_busca),
        termo_busca = COALESCE($7, termo_busca),
        unidade_medida = COALESCE($8, unidade_medida),
        regra_calculo = COALESCE($9, regra_calculo),
        ativo = COALESCE($10, ativo)
      WHERE id = $11
      RETURNING *
    `, [
      codigo_produto,
      categoria,
      item_cesta,
      marca_especificacao,
      gtin || null,
      tipo_busca,
      termo_busca,
      unidade_medida,
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
    await pool.query('UPDATE produtos_catalogo SET ativo = FALSE WHERE id = $1', [id]);
    res.json({ success: true, message: 'Produto desativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 3. CRUD DE ESTABELECIMENTOS ====================
// Listar estabelecimentos
app.get('/api/estabelecimentos', async (req, res) => {
  try {
    const { semana, ativo } = req.query;
    let sql = 'SELECT * FROM estabelecimentos WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      params.push(ativo === 'true');
      sql += ` AND ativo = $${params.length}`;
    } else {
      sql += ' AND ativo = TRUE';
    }

    if (semana) {
      params.push(Number(semana));
      sql += ` AND semana_coleta = $${params.length}`;
    }

    sql += ' ORDER BY id ASC';
    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar estabelecimento
app.post('/api/estabelecimentos', async (req, res) => {
  try {
    const { codigo_planilha, nome, bairro, municipio, uf, cnpj, semana_coleta, dia_semana, pesquisador, critica } = req.body;

    if (!codigo_planilha || !nome) {
      return res.status(400).json({ success: false, message: 'Código da planilha e nome do mercado são obrigatórios.' });
    }

    const cnpjLimpo = cnpj ? String(cnpj).replace(/\D/g, '') : null;

    const result = await pool.query(`
      INSERT INTO estabelecimentos (
        codigo_planilha, nome, bairro, municipio, uf, cnpj, semana_coleta, dia_semana, pesquisador, critica
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      codigo_planilha,
      nome,
      bairro || 'Centro',
      municipio || 'Vitória da Conquista',
      uf || 'BA',
      cnpjLimpo,
      Number(semana_coleta) || 1,
      dia_semana || 'Segunda-Feira',
      pesquisador || '',
      critica || ''
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
    const { codigo_planilha, nome, bairro, municipio, cnpj, semana_coleta, dia_semana, pesquisador, critica, ativo } = req.body;

    const cnpjLimpo = cnpj !== undefined ? (cnpj ? String(cnpj).replace(/\D/g, '') : null) : undefined;

    const result = await pool.query(`
      UPDATE estabelecimentos SET
        codigo_planilha = COALESCE($1, codigo_planilha),
        nome = COALESCE($2, nome),
        bairro = COALESCE($3, bairro),
        municipio = COALESCE($4, municipio),
        cnpj = CASE WHEN $5::text IS NOT NULL THEN $5 ELSE cnpj END,
        semana_coleta = COALESCE($6, semana_coleta),
        dia_semana = COALESCE($7, dia_semana),
        pesquisador = COALESCE($8, pesquisador),
        critica = COALESCE($9, critica),
        ativo = COALESCE($10, ativo),
        updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [
      codigo_planilha,
      nome,
      bairro,
      municipio,
      cnpjLimpo,
      semana_coleta ? Number(semana_coleta) : null,
      dia_semana,
      pesquisador,
      critica,
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
    await pool.query('UPDATE estabelecimentos SET ativo = FALSE WHERE id = $1', [id]);
    res.json({ success: true, message: 'Estabelecimento desativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 4. MATRIZ CONSOLIDADA DIEESE ====================
app.get('/api/matriz', async (req, res) => {
  try {
    const { semana, categoria, mercado, diaSemana, dataColeta, dataNfe } = req.query;

    // Mercados com endereço completo
    let estabSql = `
      SELECT 
        id, codigo_planilha, nome, bairro, municipio, cnpj, 
        COALESCE(endereco_completo, endereco, '') AS endereco_completo,
        COALESCE(endereco, endereco_completo, '') AS endereco,
        semana_coleta, dia_semana, critica 
      FROM estabelecimentos 
      WHERE ativo = TRUE
    `;
    const estabParams = [];
    if (semana) {
      estabParams.push(Number(semana));
      estabSql += ` AND semana_coleta = $${estabParams.length}`;
    }
    if (mercado) {
      estabParams.push(mercado);
      estabSql += ` AND (codigo_planilha = $${estabParams.length} OR id::text = $${estabParams.length})`;
    }
    if (diaSemana) {
      estabParams.push(diaSemana);
      estabSql += ` AND dia_semana = $${estabParams.length}`;
    }
    estabSql += ' ORDER BY id ASC';
    const estabs = (await pool.query(estabSql, estabParams)).rows;

    // Produtos
    let prodSql = `
      SELECT 
        p.id, p.codigo_produto, p.categoria, p.item_cesta, p.marca_especificacao, p.gtin, p.regra_calculo,
        hm.preco_medio AS media_anterior
      FROM produtos_catalogo p
      LEFT JOIN historico_medias hm ON hm.produto_id = p.id
      WHERE p.ativo = TRUE
    `;
    const prodParams = [];
    if (categoria) {
      prodParams.push(categoria);
      prodSql += ` AND p.categoria = $${prodParams.length}`;
    }
    prodSql += ' ORDER BY p.codigo_produto ASC, p.id ASC';
    const produtos = (await pool.query(prodSql, prodParams)).rows;

    // Preços com informações temporais e filtros de data opcionais
    let precosSql = `
      SELECT 
        id, estabelecimento_id, produto_id, 
        preco_bruto_nfe, preco_liquido_nfe, preco_final_coletado,
        alerta_outlier, motivo_alerta,
        status_conferencia, conferido_por, conferido_em, observacao_conferencia,
        data_coleta, data_emissao_nfe, intervalo_tempo
      FROM precos_coletados
      WHERE 1=1
    `;
    const precosParams = [];
    if (dataColeta) {
      precosParams.push(dataColeta);
      precosSql += ` AND DATE(data_coleta) = $${precosParams.length}::date`;
    }
    if (dataNfe) {
      precosParams.push(dataNfe);
      precosSql += ` AND DATE(data_emissao_nfe) = $${precosParams.length}::date`;
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

// Descartar / Excluir Preço Incoerente
app.delete('/api/precos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM precos_coletados WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Preço não encontrado.' });
    }
    res.json({ success: true, message: 'Preço descartado e removido com sucesso!', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 5. DETALHES DE AUDITORIA ====================
app.get('/api/precos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        pc.*,
        e.codigo_planilha AS mercado_codigo,
        e.nome AS mercado_nome,
        e.bairro AS mercado_bairro,
        p.item_cesta,
        p.marca_especificacao,
        p.codigo_produto,
        p.categoria,
        hm.preco_medio AS media_anterior
      FROM precos_coletados pc
      JOIN estabelecimentos e ON e.id = pc.estabelecimento_id
      JOIN produtos_catalogo p ON p.id = pc.produto_id
      LEFT JOIN historico_medias hm ON hm.produto_id = p.id
      WHERE pc.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 6. CONFERÊNCIA E CRÍTICA HUMANA ====================
app.post('/api/precos/:id/critica', async (req, res) => {
  try {
    const { id } = req.params;
    const { precoAjustado, statusConferencia = 'CONFERIDO', conferidoPor = 'Crítico DIEESE', observacao } = req.body;

    let updateSql = 'UPDATE precos_coletados SET ';
    const params = [];
    const fields = [];

    if (precoAjustado !== undefined && precoAjustado !== null && !isNaN(precoAjustado)) {
      params.push(Number(precoAjustado));
      fields.push(`preco_final_coletado = $${params.length}`);
    }

    params.push(statusConferencia);
    fields.push(`status_conferencia = $${params.length}`);

    params.push(conferidoPor);
    fields.push(`conferido_por = $${params.length}`);

    fields.push('conferido_em = NOW()');

    if (observacao) {
      params.push(observacao);
      fields.push(`observacao_conferencia = $${params.length}`);
    }

    // Se conferido ou ajustado, desliga alerta outlier ativo
    if (statusConferencia === 'CONFERIDO' || statusConferencia === 'AJUSTADO') {
      fields.push('alerta_outlier = FALSE');
    }

    params.push(id);
    updateSql += fields.join(', ') + ` WHERE id = $${params.length} RETURNING *`;

    const result = await pool.query(updateSql, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 7. AUTOMAÇÃO DE COLETA EM SEGUNDO PLANO ====================
app.post('/api/coleta/iniciar', async (req, res) => {
  if (coletaAtiva.emExecucao) {
    return res.status(400).json({ success: false, message: 'Uma coleta já está em andamento.' });
  }

  const { semana, limite, categoria, apenasPendentes = false, rodada = 1, minDelayMs = 2500, maxDelayMs = 4000 } = req.body;

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
      addLog(`🚀 Coleta iniciada (Rodada: ${rodada}, Modo: ${apenasPendentes ? 'Apenas Pendentes de Hoje' : 'Completa'}, Semana: ${semana || 'Todas'})`);

      // Garantir existência de coletas_lote com id 1
      try {
        await pool.query(`
          INSERT INTO coletas_lote (id, semana_coleta, status, observacoes)
          VALUES (1, 1, 'EM_ANDAMENTO', 'Lote diário principal')
          ON CONFLICT (id) DO UPDATE SET status = 'EM_ANDAMENTO', updated_at = NOW();
        `);
      } catch (loteErr) {
        console.warn('Aviso coletas_lote init:', loteErr.message);
      }

      const collector = new PrecoDaHoraCollector({
        municipio: 'vitoria da conquista',
        raioKm: 15,
        minDelayMs: Number(minDelayMs),
        maxDelayMs: Number(maxDelayMs)
      });

      // Mercados
      let estabSql = 'SELECT id, codigo_planilha, nome, bairro, cnpj FROM estabelecimentos WHERE ativo = TRUE';
      const estabParams = [];
      if (semana) {
        estabParams.push(Number(semana));
        estabSql += ` AND semana_coleta = $${estabParams.length}`;
      }
      const estabelecimentos = (await pool.query(estabSql, estabParams)).rows;

      // Produtos: se apenasPendentes = true, busca só quem NÃO tem nota válida de hoje entre 05h e 21h
      let prodSql = `
        SELECT p.id, p.codigo_produto, p.categoria, p.item_cesta, p.marca_especificacao, p.gtin, p.tipo_busca, p.termo_busca, p.regra_calculo 
        FROM produtos_catalogo p
        WHERE p.ativo = TRUE
      `;
      const prodParams = [];

      if (apenasPendentes) {
        prodSql += `
          AND p.id NOT IN (
            SELECT DISTINCT produto_id 
            FROM precos_coletados 
            WHERE DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
            AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
            AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
            AND preco_final_coletado IS NOT NULL
          )
        `;
      }

      if (categoria) {
        prodParams.push(categoria);
        prodSql += ` AND p.categoria = $${prodParams.length}`;
      }
      prodSql += ' ORDER BY p.codigo_produto ASC, p.id ASC';
      if (limite) {
        prodParams.push(Number(limite));
        prodSql += ` LIMIT $${prodParams.length}`;
      }
      const produtos = (await pool.query(prodSql, prodParams)).rows;

      coletaAtiva.total = produtos.length;
      addLog(`📋 ${produtos.length} produtos e ${estabelecimentos.length} mercados selecionados para a rodada ${rodada}.`);

      // 1. Notificação push de INÍCIO da coleta via ntfy
      try {
        await fetch('https://ntfy.sh/pdh-auto2026', {
          method: 'POST',
          headers: {
            'Title': `DIEESE - Coleta Diária Iniciada (Rodada ${rodada})`,
            'Priority': 'default',
            'Tags': 'hourglass_flowing_sand,shopping_cart'
          },
          body: `🚀 Coleta DIEESE iniciada às ${new Date().toLocaleTimeString('pt-BR')}!\n🎯 Regra: Cupons emitidos HOJE entre 05:00 e 21:00\n📦 Produtos nesta rodada: ${produtos.length}\n🏪 Mercados ativos: ${estabelecimentos.length}\n${apenasPendentes ? '🔄 Foco: Apenas itens ainda sem venda hoje.' : '📋 Foco: Varredura geral.'}`
        });
        addLog('📱 Notificação de início disparada para ntfy.sh/pdh-auto2026');
      } catch (ntfyInitErr) {
        console.warn('Aviso ntfy início:', ntfyInitErr.message);
      }

      const inicioTimestamp = Date.now();
      let totalEncontrados = 0;
      let totalNaoEncontrados = 0;
      let totalDescartadosForaJanela = 0;

      for (let i = 0; i < produtos.length; i++) {
        const prod = produtos[i];
        coletaAtiva.atual = i + 1;
        coletaAtiva.progresso = Math.round(((i + 1) / produtos.length) * 100);
        coletaAtiva.itemAtual = `${prod.marca_especificacao} (${i + 1}/${produtos.length})`;

        addLog(`🔍 [${i + 1}/${produtos.length}] Consultando: ${prod.marca_especificacao}...`);

        let ofertas = [];
        try {
          if (prod.tipo_busca === 'GTIN' && prod.gtin) {
            ofertas = await collector.consultarProduto({ gtin: prod.gtin, ordenar: 'preco.asc' });
          } else {
            ofertas = await collector.consultarProduto({ termo: prod.termo_busca, ordenar: 'preco.asc' });
          }
        } catch (err) {
          addLog(`⚠️ Erro ao consultar ${prod.marca_especificacao}: ${err.message}`);
          continue;
        }

        const mercadosComOferta = new Set();

        for (const oferta of ofertas) {
          // Validação estrita da data de emissão: DEVE ser de hoje entre 05:00 e 21:00
          const dataNfeRaw = oferta.produto?.data;
          const ehDoDiaValido = isCupomValidoDoDia(dataNfeRaw);

          if (!ehDoDiaValido) {
            totalDescartadosForaJanela++;
            continue;
          }

          const estOferta = oferta.estabelecimento;
          const cnpjOferta = estOferta?.cnpj ? String(estOferta.cnpj).replace(/\D/g, '') : '';
          const nomeOferta = String(estOferta?.nomeEstabelecimento || '').toUpperCase();
          const bairroOferta = String(estOferta?.bairro || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

          const matchedEstab = estabelecimentos.find(e => {
            if (e.cnpj && cnpjOferta) {
              return String(e.cnpj).replace(/\D/g, '') === cnpjOferta;
            }
            const nomeCad = e.nome.toUpperCase();
            const bairroCad = String(e.bairro || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const nomeMatch = nomeOferta.includes(nomeCad) || nomeCad.includes(nomeOferta);
            if (nomeMatch && bairroCad && bairroOferta) {
              return bairroCad === bairroOferta;
            }
            return nomeMatch;
          });

          if (matchedEstab) {
            mercadosComOferta.add(matchedEstab.id);
            await collector.salvarPreco({
              coletaId: 1,
              estabelecimentoId: matchedEstab.id,
              produtoId: prod.id,
              oferta,
              regraCalculo: prod.regra_calculo
            });
            totalEncontrados++;
            addLog(`   🎯 Salvo (Hoje): ${matchedEstab.codigo_planilha} (${matchedEstab.nome}) - R$ ${oferta.produto.precoBruto ?? oferta.produto.precoUnitario}`);
          }
        }

        // Para estabelecimentos sem oferta emitida hoje, registrar NAO_ENCONTRADO para re-tentativa
        for (const estab of estabelecimentos) {
          if (!mercadosComOferta.has(estab.id)) {
            totalNaoEncontrados++;
            await pool.query(`
              INSERT INTO precos_coletados (
                coleta_id, estabelecimento_id, produto_id, status_conferencia, data_coleta
              ) VALUES (1, $1, $2, 'NAO_ENCONTRADO', NOW())
              ON CONFLICT (coleta_id, estabelecimento_id, produto_id) 
              DO UPDATE SET
                status_conferencia = CASE WHEN precos_coletados.preco_final_coletado IS NULL THEN 'NAO_ENCONTRADO' ELSE precos_coletados.status_conferencia END,
                data_coleta = NOW();
            `, [estab.id, prod.id]);
          }
        }

        if (mercadosComOferta.size === 0) {
          addLog(`   ✕ Nenhuma venda registrada HOJE (05h às 21h) para ${prod.marca_especificacao}. Aguardando próxima rodada.`);
        }
      }

      const duracaoSegundos = Number(((Date.now() - inicioTimestamp) / 1000).toFixed(1));
      const resumoMsg = `Rodada ${rodada} finalizada com ${totalEncontrados} preços válidos de hoje e ${totalNaoEncontrados} não encontrados (ou sem venda no dia) em ${duracaoSegundos}s.`;
      addLog(`🏁 ${resumoMsg}`);

      // Persistir em historico_execucoes
      try {
        await pool.query(`
          INSERT INTO historico_execucoes (
            semana_coleta, total_buscas, total_encontrados, total_nao_encontrados, duracao_segundos, status, mensagem_resumo, logs
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          semana ? Number(semana) : null,
          produtos.length,
          totalEncontrados,
          totalNaoEncontrados,
          duracaoSegundos,
          'CONCLUIDO',
          resumoMsg,
          JSON.stringify(coletaAtiva.logs.slice(0, 50))
        ]);
      } catch (dbLogErr) {
        console.error('Erro ao salvar historico_execucoes:', dbLogErr);
      }

      // 2. Consulta detalhada de itens que permanecem NÃO concluídos no dia
      let pendentesHoje = [];
      try {
        const pendRes = await pool.query(`
          SELECT pc.codigo_produto, pc.item_cesta, pc.marca_especificacao
          FROM produtos_catalogo pc
          WHERE pc.ativo = TRUE
          AND pc.id NOT IN (
            SELECT DISTINCT produto_id 
            FROM precos_coletados 
            WHERE DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
            AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
            AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
            AND preco_final_coletado IS NOT NULL
          )
          ORDER BY pc.codigo_produto ASC
        `);
        pendentesHoje = pendRes.rows;
      } catch (pendErr) {
        console.error('Erro ao consultar pendências do dia:', pendErr);
      }

      // 3. Notificação de CONCLUSÃO / FECHAMENTO via ntfy
      try {
        let relatorioCorpo = `✅ Rodada ${rodada} finalizada em ${duracaoSegundos}s!\n🎯 Preços com nota de hoje: ${totalEncontrados}\n`;

        if (pendentesHoje.length > 0) {
          relatorioCorpo += `\n⚠️ ITENS NÃO CONCLUÍDOS NO DIA (${pendentesHoje.length} sem nota fiscal entre 05h e 21h):\n`;
          relatorioCorpo += pendentesHoje.slice(0, 15).map(p => `• [${p.codigo_produto}] ${p.item_cesta} (${p.marca_especificacao})`).join('\n');
          if (pendentesHoje.length > 15) {
            relatorioCorpo += `\n... e mais ${pendentesHoje.length - 15} itens pendentes.`;
          }
        } else {
          relatorioCorpo += '\n🎉 TODOS OS PRODUTOS FORAM CONCLUÍDOS COM NOTAS DE HOJE!';
        }

        relatorioCorpo += '\n🔗 Painel: https://precodahora.dmi89h.easypanel.host/';

        const ehFechamento = rodada === 'fechamento' || rodada === 4 || rodada === '4';

        await fetch('https://ntfy.sh/pdh-auto2026', {
          method: 'POST',
          headers: {
            'Title': ehFechamento ? 'DIEESE - Fechamento Diário de Preços' : `DIEESE - Relatório da Rodada ${rodada}`,
            'Priority': ehFechamento ? 'high' : 'default',
            'Tags': ehFechamento ? 'warning,bar_chart' : 'white_check_mark,bar_chart'
          },
          body: relatorioCorpo
        });
        addLog('📱 Relatório de conclusão e pendências enviado para ntfy.sh/pdh-auto2026');
      } catch (ntfyErr) {
        console.warn('Aviso ntfy final:', ntfyErr.message);
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

// Relatório consolidado de cobertura do dia (05h às 21h)
app.get('/api/relatorio-diario', async (req, res) => {
  try {
    const totalProdRes = await pool.query('SELECT COUNT(*) FROM produtos_catalogo WHERE ativo = TRUE');
    const totalProdutos = Number(totalProdRes.rows[0].count);

    const pendRes = await pool.query(`
      SELECT pc.id, pc.codigo_produto, pc.categoria, pc.item_cesta, pc.marca_especificacao
      FROM produtos_catalogo pc
      WHERE pc.ativo = TRUE
      AND pc.id NOT IN (
        SELECT DISTINCT produto_id 
        FROM precos_coletados 
        WHERE DATE(data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
        AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
        AND EXTRACT(HOUR FROM data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
        AND preco_final_coletado IS NOT NULL
      )
      ORDER BY pc.codigo_produto ASC
    `);

    const concluidosRes = await pool.query(`
      SELECT DISTINCT pc.id, pc.codigo_produto, pc.item_cesta, pc.marca_especificacao
      FROM produtos_catalogo pc
      JOIN precos_coletados pr ON pr.produto_id = pc.id
      WHERE pc.ativo = TRUE
      AND DATE(pr.data_emissao_nfe AT TIME ZONE 'America/Bahia') = CURRENT_DATE
      AND EXTRACT(HOUR FROM pr.data_emissao_nfe AT TIME ZONE 'America/Bahia') >= 5
      AND EXTRACT(HOUR FROM pr.data_emissao_nfe AT TIME ZONE 'America/Bahia') <= 21
      AND pr.preco_final_coletado IS NOT NULL
      ORDER BY pc.codigo_produto ASC
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

// ==================== 8. HISTÓRICO & LOGS DE EXECUÇÕES ====================
app.get('/api/execucoes', async (req, res) => {
  try {
    const runs = await pool.query('SELECT * FROM historico_execucoes ORDER BY id DESC LIMIT 30');
    const hoje = await pool.query(`
      SELECT 
        COUNT(*) as total_lotes_hoje,
        COALESCE(SUM(total_buscas), 0) as total_buscas_hoje,
        COALESCE(SUM(total_encontrados), 0) as total_encontrados_hoje,
        COALESCE(SUM(total_nao_encontrados), 0) as total_nao_encontrados_hoje,
        COALESCE(SUM(total_alertas), 0) as total_alertas_hoje
      FROM historico_execucoes
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
    const response = await fetch('https://ntfy.sh/pdh-auto2026', {
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

// Auto-inicialização de schema e catálogo de produtos/mercados
async function autoInitDatabase() {
  try {
    console.log('⚙️ Verificando e atualizando schema no banco de dados...');
    
    // Migração de resiliência: permitir NULL e criar índice único
    try {
      await pool.query('ALTER TABLE precos_coletados ALTER COLUMN preco_final_coletado DROP NOT NULL;');
      await pool.query(`
        DELETE FROM precos_coletados a
        USING precos_coletados b
        WHERE a.id < b.id
          AND a.coleta_id = b.coleta_id
          AND a.estabelecimento_id = b.estabelecimento_id
          AND a.produto_id = b.produto_id;
      `);
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_precos_coleta_estab_prod 
        ON precos_coletados (coleta_id, estabelecimento_id, produto_id);
      `);
      await pool.query(`
        ALTER TABLE precos_coletados DROP CONSTRAINT IF EXISTS precos_coletados_coleta_id_fkey;
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS coletas_lote (
          id SERIAL PRIMARY KEY,
          semana_coleta INT NOT NULL,
          data_inicio TIMESTAMPTZ DEFAULT NOW(),
          data_fim TIMESTAMPTZ,
          status VARCHAR(20) DEFAULT 'EM_ANDAMENTO',
          total_itens_esperados INT DEFAULT 0,
          total_itens_coletados INT DEFAULT 0,
          observacoes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await pool.query(`
        INSERT INTO coletas_lote (id, semana_coleta, status, observacoes)
        VALUES (1, 1, 'CONCLUIDO', 'Lote Inicial Padrão')
        ON CONFLICT (id) DO NOTHING;
      `);
      await pool.query(`
        ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS endereco TEXT;
      `);
      await pool.query(`
        ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS endereco_completo TEXT;
      `);
      console.log('✅ Índice único uq_precos_coleta_estab_prod e tabelas sincronizados.');
    } catch (migErr) {
      console.warn('Aviso migração uq_precos_coleta_estab_prod:', migErr.message);
    }

    const schemaSql = fs.readFileSync(path.resolve('schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Schema e colunas conferidos com sucesso.');

    const check = await pool.query("SELECT COUNT(*) FROM estabelecimentos");
    if (Number(check.rows[0].count) === 0) {
      if (fs.existsSync(path.resolve('seed-data.sql'))) {
        console.log('🌱 Inserindo catálogo de produtos e estabelecimentos...');
        const seedSql = fs.readFileSync(path.resolve('seed-data.sql'), 'utf8');
        await pool.query(seedSql);
        console.log('✅ Dados iniciais populados com sucesso!');
      }
    }
  } catch (err) {
    console.error('⚠️ Aviso durante auto-inicialização do banco:', err.message);
  }
}

// Endpoint para inicialização manual forçada do banco
app.post('/api/setup-db', async (req, res) => {
  try {
    const schemaSql = fs.readFileSync(path.resolve('schema.sql'), 'utf8');
    await pool.query(schemaSql);

    let seedApplied = false;
    if (fs.existsSync(path.resolve('seed-data.sql'))) {
      const seedSql = fs.readFileSync(path.resolve('seed-data.sql'), 'utf8');
      await pool.query(seedSql);
      seedApplied = true;
    }

    res.json({ success: true, message: 'Banco inicializado com sucesso', seedApplied });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`🌐 Servidor Preço da Hora DIEESE rodando em: http://localhost:${PORT}`);
  await autoInitDatabase();
});

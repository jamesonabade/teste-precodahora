import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import pg from 'pg';

import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPREADSHEET_PATH = path.resolve(__dirname, '../planilha/Planilha_Coleta_2026_SETEMBRO_CB_DIEESE_TRADICIONAL (1).xlsx');

export async function runSpreadsheetImport() {
  console.log('--- INICIANDO IMPORTAÇÃO DA PLANILHA OFICIAL DIEESE ---');
  if (!fs.existsSync(SPREADSHEET_PATH)) {
    throw new Error(`Planilha não encontrada em: ${SPREADSHEET_PATH}`);
  }

  const wb = XLSX.readFile(SPREADSHEET_PATH);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Executar DDL do Schema V3 para garantir tabelas e colunas
    const schemaV3Path = path.resolve(__dirname, '../database/schema_v3.sql');
    if (fs.existsSync(schemaV3Path)) {
      const schemaV3Sql = fs.readFileSync(schemaV3Path, 'utf8');
      await client.query(schemaV3Sql);
      console.log('✓ Schema V3 aplicado com sucesso.');
    }

    // 2. Extrair 40 Estabelecimentos da aba "Calendário"
    const calSheet = wb.Sheets['Calendário'];
    const calRows = XLSX.utils.sheet_to_json(calSheet, { header: 1 });
    const estabelecimentos = [];
    const calendarioRows = [];

    for (let i = 3; i <= 42; i++) {
      const r = calRows[i];
      if (!r || !r[0]) continue;
      const codM = String(r[0]).trim(); // M1 .. M40
      const codExtRaw = r[1] ? String(r[1]).trim() : null;
      const codExt = (codExtRaw === 'Verificar' || !codExtRaw) ? null : codExtRaw;
      const nome = r[2] ? String(r[2]).trim() : '';
      const bairro = r[3] ? String(r[3]).trim() : '';
      const semana = parseInt(r[4]) || 1;
      const diaSemana = r[5] ? String(r[5]).trim() : 'Segunda-Feira';
      const dataPrevista = r[6] ? XLSX.SSF.format('yyyy-mm-dd', r[6]) : null;
      const dataEfetiva = r[7] ? XLSX.SSF.format('yyyy-mm-dd', r[7]) : dataPrevista;
      const pesquisador = r[8] ? String(r[8]).trim() : null;
      const critica = r[9] ? String(r[9]).trim() : null;
      const prints = r[10] ? String(r[10]).trim() : null;
      const registros = parseInt(r[11]) || 0;

      estabelecimentos.push({
        codigo_estabelecimento: codM,
        codigo_externo: codExt,
        nome,
        bairro
      });

      calendarioRows.push({
        codigo_estabelecimento: codM,
        codigo_externo: codExt,
        nome_estabelecimento: nome,
        bairro,
        semana,
        dia_semana: diaSemana,
        data_prevista: dataPrevista,
        data_efetiva: dataEfetiva,
        pesquisador,
        critica_validador: critica,
        prints_validador: prints,
        qtd_registrada: registros
      });
    }

    // Sincronizar tb_estabelecimento preservando CNPJ existente
    console.log(`Atualizando ${estabelecimentos.length} estabelecimentos em tb_estabelecimento...`);
    const idMap = new Map(); // codM -> id_estabelecimento

    for (const est of estabelecimentos) {
      // Tenta localizar por codigo_estabelecimento, codigo_externo ou nome
      const checkRes = await client.query(
        `SELECT id_estabelecimento, cnpj FROM tb_estabelecimento 
         WHERE codigo_estabelecimento = $1 OR (codigo_externo IS NOT NULL AND codigo_externo = $2) OR nome ILIKE $3 
         LIMIT 1`,
        [est.codigo_estabelecimento, est.codigo_externo, est.nome]
      );

      let idEstab;
      if (checkRes.rows.length > 0) {
        idEstab = checkRes.rows[0].id_estabelecimento;
        await client.query(
          `UPDATE tb_estabelecimento 
           SET codigo_estabelecimento = $1, 
               codigo_externo = COALESCE($2, codigo_externo), 
               nome = $3, 
               bairro = $4,
               updated_at = NOW()
           WHERE id_estabelecimento = $5`,
          [est.codigo_estabelecimento, est.codigo_externo, est.nome, est.bairro, idEstab]
        );
      } else {
        const insRes = await client.query(
          `INSERT INTO tb_estabelecimento (codigo_estabelecimento, codigo_externo, nome, bairro, status_ativo)
           VALUES ($1, $2, $3, $4, TRUE)
           RETURNING id_estabelecimento`,
          [est.codigo_estabelecimento, est.codigo_externo, est.nome, est.bairro]
        );
        idEstab = insRes.rows[0].id_estabelecimento;
      }
      idMap.set(est.codigo_estabelecimento, idEstab);
    }
    console.log('✓ tb_estabelecimento sincronizada com códigos M1..M40 e externos E*.**.');

    // 3. Extrair 76 Produtos Oficiais e Médias da aba "Resumos, Totais e Médias"
    const resSheet = wb.Sheets['Resumos, Totais e Médias'];
    const resRows = XLSX.utils.sheet_to_json(resSheet, { header: 1 });
    const produtos = [];
    let currentCat = '';
    let currentSubItem = '';

    for (let i = 1; i < resRows.length; i++) {
      const r = resRows[i];
      if (!r || r.length === 0) continue;

      // Detectar categoria principal (ex: Açúcar 1.1.05)
      if (r[0] && !r[1] && !r[2] && !r[3]) {
        if (r[0].includes('1.') || r[0].includes('2.') || r[0].includes('3.')) {
          currentCat = String(r[0]).trim();
          currentSubItem = '';
          continue;
        } else {
          currentSubItem = String(r[0]).trim();
          continue;
        }
      }

      if (r[0] && !r[1] && !r[2] && r[3] === undefined) {
        currentSubItem = String(r[0]).trim();
        continue;
      }

      const codDieese = r[1] ? String(r[1]).trim() : '';
      const descMarca = r[2] ? String(r[2]).trim() : '';
      const gtin = r[3] !== undefined && r[3] !== null ? String(r[3]).trim() : '';
      const precoAntRaw = r[r.length - 5];
      const precoAnt = typeof precoAntRaw === 'number' ? precoAntRaw : null;

      if ((codDieese || descMarca || gtin) && gtin !== 'CONTAGEM PREÇOS:') {
        // Derivar unidade de medida
        let unidade = 'UN';
        const combined = `${currentSubItem} ${descMarca}`.toUpperCase();
        if (combined.includes('1KG') || combined.includes('1 KG') || combined.includes(' KG')) unidade = 'KG';
        else if (combined.includes('500G') || combined.includes('400G') || combined.includes('250G') || combined.includes('150G')) unidade = 'G';
        else if (combined.includes('1L') || combined.includes('1 L') || combined.includes('1 LT') || combined.includes('900ML')) unidade = 'LT';
        else if (combined.includes('UNID')) unidade = 'UN';

        produtos.push({
          categoria: currentCat || 'Geral',
          subItem: currentSubItem,
          codigo_dieese: codDieese,
          descricao_item: descMarca || currentSubItem,
          codigo_barras: gtin || null,
          unidade_medida: unidade,
          preco_medio_anterior: precoAnt
        });
      }
    }

    console.log(`Encontrados ${produtos.length} produtos oficiais da Cesta Básica DIEESE na planilha.`);

    // Deduplicar produtos redundantes prévios
    const dups = await client.query(`
      SELECT codigo_dieese, descricao_item, MIN(id_produto) as canonical_id, array_agg(id_produto) as all_ids
      FROM tb_produto_dieese
      GROUP BY codigo_dieese, descricao_item
      HAVING count(*) > 1
    `);
    for (const d of dups.rows) {
      const canonical = d.canonical_id;
      const otherIds = d.all_ids.filter(id => id !== canonical);
      if (otherIds.length > 0) {
        await client.query(`UPDATE tb_coleta_automatizada SET id_produto = $1 WHERE id_produto = ANY($2::int[])`, [canonical, otherIds]);
        await client.query(`DELETE FROM tb_produto_dieese WHERE id_produto = ANY($1::int[])`, [otherIds]);
      }
    }

    // Limpar tb_media_referencia_dieese antes da recarga
    await client.query('DELETE FROM tb_media_referencia_dieese');

    const prodIdMap = new Map(); // chave única (codDieese + descricao_item) -> id_produto

    for (const p of produtos) {
      // Verificar se o produto já existe
      const existProd = await client.query(
        `SELECT id_produto FROM tb_produto_dieese 
         WHERE (codigo_dieese = $1 AND descricao_item = $2)
            OR (codigo_barras IS NOT NULL AND codigo_barras = $3)
         LIMIT 1`,
        [p.codigo_dieese, p.descricao_item, p.codigo_barras]
      );

      let idProd;
      if (existProd.rows.length > 0) {
        idProd = existProd.rows[0].id_produto;
        await client.query(
          `UPDATE tb_produto_dieese 
           SET categoria = $1, 
               codigo_dieese = $2, 
               descricao_item = $3, 
               codigo_barras = $4, 
               unidade_medida = $5,
               status_ativo = TRUE
           WHERE id_produto = $6`,
          [p.categoria, p.codigo_dieese, p.descricao_item, p.codigo_barras, p.unidade_medida, idProd]
        );
      } else {
        const insP = await client.query(
          `INSERT INTO tb_produto_dieese (categoria, codigo_dieese, descricao_item, codigo_barras, unidade_medida, status_ativo)
           VALUES ($1, $2, $3, $4, $5, TRUE)
           RETURNING id_produto`,
          [p.categoria, p.codigo_dieese, p.descricao_item, p.codigo_barras, p.unidade_medida]
        );
        idProd = insP.rows[0].id_produto;
      }
      prodIdMap.set(`${p.codigo_dieese}|${p.descricao_item}`, idProd);

      // Inserir histórico de média do mês anterior
      if (p.preco_medio_anterior !== null && p.preco_medio_anterior !== undefined) {
        await client.query(
          `INSERT INTO tb_media_referencia_dieese (id_produto, codigo_dieese, descricao_item, codigo_barras, mes_referencia, preco_medio_anterior)
           VALUES ($1, $2, $3, $4, '2026-08', $5)
           ON CONFLICT (codigo_dieese, descricao_item, mes_referencia) 
           DO UPDATE SET preco_medio_anterior = EXCLUDED.preco_medio_anterior, id_produto = EXCLUDED.id_produto`,
          [idProd, p.codigo_dieese, p.descricao_item, p.codigo_barras, p.preco_medio_anterior]
        );
      }
    }

    // Inativar produtos que não fazem mais parte dos 76 oficiais
    await client.query(
      `UPDATE tb_produto_dieese 
       SET status_ativo = FALSE 
       WHERE id_produto NOT IN (${Array.from(prodIdMap.values()).join(',')})`
    );
    console.log('✓ tb_produto_dieese e tb_media_referencia_dieese preenchidas com os 76 produtos oficiais.');

    // 4. Inserir/Atualizar tb_calendario_coleta
    await client.query('DELETE FROM tb_calendario_coleta');
    for (const cal of calendarioRows) {
      const idEstab = idMap.get(cal.codigo_estabelecimento);
      await client.query(
        `INSERT INTO tb_calendario_coleta (
           id_estabelecimento, codigo_estabelecimento, codigo_externo, nome_estabelecimento,
           bairro, semana, dia_semana, data_prevista, data_efetiva, pesquisador,
           critica_validador, prints_validador, total_esperado, qtd_registrada, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 76, $13, 
                   CASE WHEN $13 >= 76 THEN 'CONCLUIDO' WHEN $13 > 0 THEN 'EM_ANDAMENTO' ELSE 'PENDENTE' END)`,
        [
          idEstab, cal.codigo_estabelecimento, cal.codigo_externo, cal.nome_estabelecimento,
          cal.bairro, cal.semana, cal.dia_semana, cal.data_prevista, cal.data_efetiva,
          cal.pesquisador, cal.critica_validador, cal.prints_validador, cal.qtd_registrada
        ]
      );
    }
    console.log('✓ tb_calendario_coleta preenchida com as 40 escalas.');

    // 5. Atualizar tb_configuracao_automacao
    await client.query(
      `UPDATE tb_configuracao_automacao 
       SET cron_agendamento = '0 12,18,19,21 * * *',
           hora_inicio_janela = '05:00:00',
           hora_fim_janela = '21:00:00',
           apenas_vendas_do_dia = TRUE,
           dias_maximos_nfe = 1,
           descricao_observacao = 'Horários estratégicos: 12:00, 18:00, 19:00 e 21:00. Vendas estritamente do dia.'
       WHERE nome_perfil = 'PADRAO'`
    );
    console.log('✓ tb_configuracao_automacao atualizada com os horários estratégicos (12h, 18h, 19h, 21h).');

    await client.query('COMMIT');
    console.log('=== IMPORTAÇÃO CONCLUÍDA COM TOTAL SUCESSO ===');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERRO NA IMPORTAÇÃO DA PLANILHA:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSpreadsheetImport()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

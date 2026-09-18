import xlsx from 'xlsx';
import path from 'path';
import { pool } from './db.js';

async function seedHistory() {
  const client = await pool.connect();
  try {
    console.log('📈 Iniciando carga do Histórico de Médias do Mês Anterior...');

    const filePath = path.resolve('planilha/Planilha_Coleta_2026_SETEMBRO_CB_DIEESE_TRADICIONAL.xlsx');
    const workbook = xlsx.readFile(filePath);

    const sheet = workbook.Sheets['Histórico - Média Mês Anterior'];
    if (!sheet) {
      throw new Error('Aba "Histórico - Média Mês Anterior" não encontrada na planilha.');
    }

    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    await client.query('BEGIN');

    // Carregar catálogo de produtos do banco para correlacionar
    const prodsRes = await client.query('SELECT id, codigo_produto, marca_especificacao, gtin FROM produtos_catalogo');
    const prodsMap = new Map();
    for (const p of prodsRes.rows) {
      if (p.gtin) prodsMap.set(String(p.gtin).trim(), p.id);
      prodsMap.set(p.marca_especificacao.toUpperCase().trim(), p.id);
    }

    let inseridos = 0;
    for (let r = 3; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;

      const rawMarca = row[2] ? String(row[2]).trim() : '';
      const rawGtin = row[3] ? String(row[3]).trim() : '';
      const precoMedio = row[4] ? Number(row[4]) : null;

      if (!precoMedio || isNaN(precoMedio)) continue;

      let produtoId = null;
      if (rawGtin && prodsMap.has(rawGtin)) {
        produtoId = prodsMap.get(rawGtin);
      } else if (rawMarca && prodsMap.has(rawMarca.toUpperCase())) {
        produtoId = prodsMap.get(rawMarca.toUpperCase());
      }

      if (produtoId) {
        await client.query(`
          INSERT INTO historico_medias (mes_ano_referencia, produto_id, preco_medio)
          VALUES ('2026-08', $1, $2)
          ON CONFLICT DO NOTHING
        `, [produtoId, precoMedio]);
        inseridos++;
      }
    }

    await client.query('COMMIT');
    console.log(`✅ ${inseridos} médias do mês anterior importadas com sucesso para a tabela historico_medias!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao importar histórico de médias:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedHistory();

import xlsx from 'xlsx';
import path from 'path';
import { pool } from './db.js';

// Mapeamento prévio de CNPJs conhecidos de Vitória da Conquista
const CNPJ_MAP = {
  'M1': '03915392000107',  // Atakarejo
  'M21': '04641376047795', // Supermercados BH (Rosa Cruz)
};

async function seedData() {
  const client = await pool.connect();
  try {
    console.log('🌱 Iniciando carga de metadados da planilha DIEESE...');

    const filePath = path.resolve('planilha/Planilha_Coleta_2026_SETEMBRO_CB_DIEESE_TRADICIONAL.xlsx');
    const workbook = xlsx.readFile(filePath);

    await client.query('BEGIN');

    // 1. Carga dos Estabelecimentos (Aba Calendário)
    const cal = workbook.Sheets['Calendário'];
    const calJson = xlsx.utils.sheet_to_json(cal, { header: 1 });
    let totalMercados = 0;

    for (let r = 3; r < calJson.length; r++) {
      const row = calJson[r];
      if (row && row[0] && String(row[0]).startsWith('M') && row[2]) {
        const codigo = String(row[0]).trim();
        const nome = String(row[2]).trim();
        const bairro = row[3] ? String(row[3]).trim() : null;
        const semana = Number(row[4]) || 1;
        const diaSemana = row[5] ? String(row[5]).trim() : null;
        const pesquisador = row[8] ? String(row[8]).trim() : null;
        const critica = row[9] ? String(row[9]).trim() : null;
        const cnpj = CNPJ_MAP[codigo] || null;

        await client.query(`
          INSERT INTO estabelecimentos (codigo_planilha, nome, bairro, municipio, uf, cnpj, semana_coleta, dia_semana, pesquisador, critica)
          VALUES ($1, $2, $3, 'Vitória da Conquista', 'BA', $4, $5, $6, $7, $8)
          ON CONFLICT (codigo_planilha) DO UPDATE SET
            nome = EXCLUDED.nome,
            bairro = EXCLUDED.bairro,
            cnpj = COALESCE(EXCLUDED.cnpj, estabelecimentos.cnpj),
            semana_coleta = EXCLUDED.semana_coleta,
            dia_semana = EXCLUDED.dia_semana,
            pesquisador = EXCLUDED.pesquisador,
            critica = EXCLUDED.critica,
            updated_at = NOW()
        `, [codigo, nome, bairro, cnpj, semana, diaSemana, pesquisador, critica]);

        totalMercados++;
      }
    }
    console.log(`✅ ${totalMercados} estabelecimentos cadastrados/atualizados.`);

    // 2. Carga dos Produtos do Catálogo (Aba M1)
    const m1 = workbook.Sheets['M1'];
    const m1Json = xlsx.utils.sheet_to_json(m1, { header: 1 });
    let totalProdutos = 0;

    let currentCategoria = '';
    let currentItem = '';

    for (let r = 6; r < m1Json.length; r++) {
      const row = m1Json[r];
      if (!row || row.length === 0) continue;

      if (row[0] && !row[1] && !row[3]) {
        if (String(row[0]).match(/\d+\.\d+\.\d+/)) {
          currentCategoria = String(row[0]).trim();
        } else {
          currentItem = String(row[0]).trim();
        }
      } else if (row[1] && row[3] && String(row[1]) !== 'CÓDIGO DO PRODUTO') {
        const codigoProd = String(row[1]).trim();
        const marca = row[2] ? String(row[2]).trim() : '';
        const rawGtin = String(row[3]).trim();

        const isGtinNumeric = /^\d+$/.test(rawGtin);
        const tipoBusca = isGtinNumeric ? 'GTIN' : 'TERMO';
        const gtin = isGtinNumeric ? rawGtin : null;
        const termoBusca = !isGtinNumeric ? rawGtin : marca;

        let regraCalculo = 'PADRAO';
        let unidadeMedida = 'UN';

        const rawUpper = (marca + ' ' + rawGtin + ' ' + currentItem).toUpperCase();
        if (rawUpper.includes('PÃO') || rawUpper.includes('PAO')) {
          regraCalculo = 'PAO_KG';
          unidadeMedida = 'KG';
        } else if (rawUpper.includes('OVO')) {
          regraCalculo = 'OVO_UNIDADE';
          unidadeMedida = 'UN';
        } else if (rawUpper.includes('1KG') || rawUpper.includes('1 KG') || rawUpper.includes('KG')) {
          unidadeMedida = 'KG';
        }

        await client.query(`
          INSERT INTO produtos_catalogo (codigo_produto, categoria, item_cesta, marca_especificacao, gtin, tipo_busca, termo_busca, unidade_medida, regra_calculo)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT DO NOTHING
        `, [codigoProd, currentCategoria, currentItem, marca, gtin, tipoBusca, termoBusca, unidadeMedida, regraCalculo]);

        totalProdutos++;
      }
    }
    console.log(`✅ ${totalProdutos} itens de produtos da Cesta Básica catalogados.`);

    // 3. Cria lote inicial de coleta
    const loteRes = await client.query(`
      INSERT INTO coletas_lote (mes_ano_referencia, semana, status, observacoes)
      VALUES ('2026-09', 1, 'EM_ANDAMENTO', 'Lote inicial de setembro de 2026')
      RETURNING id;
    `);
    console.log(`✅ Lote de coleta criado com ID: ${loteRes.rows[0].id}`);

    await client.query('COMMIT');
    console.log('🎉 Seed de dados concluído com sucesso!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro no seed de dados:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();

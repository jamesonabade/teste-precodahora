import { pool } from '../src/db.js';

async function verify() {
  const tComment = await pool.query(`
    SELECT obj_description('tb_configuracao_automacao'::regclass, 'pg_class') as table_desc
  `);
  console.log('📌 Descrição da Tabela tb_configuracao_automacao:');
  console.log('  ->', tComment.rows[0].table_desc);

  const colComments = await pool.query(`
    SELECT 
      cols.column_name,
      pg_catalog.col_description(c.oid, cols.ordinal_position::int) as column_desc
    FROM information_schema.columns cols
    JOIN pg_catalog.pg_class c ON c.relname = cols.table_name
    WHERE cols.table_name = 'tb_configuracao_automacao'
    ORDER BY cols.ordinal_position
  `);

  console.log('\n📌 Descrição de Cada Coluna (Dicionário de Dados PostgreSQL):');
  colComments.rows.forEach(r => {
    console.log(`  - [${r.column_name}]: ${r.column_desc || 'Sem comentário'}`);
  });

  const configRow = await pool.query('SELECT * FROM tb_configuracao_automacao WHERE ativo = TRUE LIMIT 1');
  console.log('\n⚙️ Perfil Ativo tb_configuracao_automacao:');
  console.log(configRow.rows[0]);

  await pool.end();
}

verify().catch(console.error);

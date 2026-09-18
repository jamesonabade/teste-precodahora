import { pool } from '../src/db.js';

async function run() {
  try {
    console.log('1. Allowing NULL in preco_final_coletado for items pending / not found...');
    await pool.query('ALTER TABLE precos_coletados ALTER COLUMN preco_final_coletado DROP NOT NULL;');

    console.log('2. Removing potential duplicates before creating unique index...');
    await pool.query(`
      DELETE FROM precos_coletados a
      USING precos_coletados b
      WHERE a.id < b.id
        AND a.coleta_id = b.coleta_id
        AND a.estabelecimento_id = b.estabelecimento_id
        AND a.produto_id = b.produto_id;
    `);

    console.log('3. Creating UNIQUE index uq_precos_coleta_estab_prod...');
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_precos_coleta_estab_prod 
      ON precos_coletados (coleta_id, estabelecimento_id, produto_id);
    `);

    const countRes = await pool.query('SELECT count(1) as total FROM precos_coletados');
    console.log('Current precos_coletados count:', countRes.rows[0].total);
    console.log('Local migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

run();

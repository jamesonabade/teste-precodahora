import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('🚀 Iniciando migração para Schema V2...');
  const client = await pool.connect();

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema_v2.sql'), 'utf-8');
    console.log('📄 Executando schema_v2.sql...');
    await client.query(schemaSql);
    console.log('✅ Tabelas e views V2 criadas com sucesso!');

    const migrateSql = fs.readFileSync(path.join(__dirname, 'migrate_to_v2.sql'), 'utf-8');
    console.log('📦 Executando migrate_to_v2.sql...');
    await client.query(migrateSql);
    console.log('✅ Dados migrados com sucesso!');

    // Conferência
    const resEstab = await client.query('SELECT COUNT(*) FROM tb_estabelecimento');
    const resProd = await client.query('SELECT COUNT(*) FROM tb_produto_dieese');
    const resUser = await client.query('SELECT COUNT(*) FROM tb_usuario');
    const resColeta = await client.query('SELECT COUNT(*) FROM tb_coleta_automatizada');
    const resVal = await client.query('SELECT COUNT(*) FROM tb_validacao_critica');

    console.log('\n📊 Resumo da Base V2:');
    console.log(`- tb_estabelecimento: ${resEstab.rows[0].count} registros`);
    console.log(`- tb_produto_dieese: ${resProd.rows[0].count} registros`);
    console.log(`- tb_usuario: ${resUser.rows[0].count} registros`);
    console.log(`- tb_coleta_automatizada: ${resColeta.rows[0].count} registros`);
    console.log(`- tb_validacao_critica: ${resVal.rows[0].count} registros`);

  } catch (err) {
    console.error('❌ Erro na migração:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

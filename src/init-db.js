import fs from 'fs';
import path from 'path';
import { pool, testConnection } from './db.js';

async function initDb() {
  try {
    console.log('🔌 Testando conexão com PostgreSQL...');
    const connInfo = await testConnection();
    console.log('✅ Conectado com sucesso:', connInfo);

    const schemaPath = path.resolve('schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚙️ Executando schema.sql (DDL)...');
    await pool.query(sql);
    console.log('🎉 Tabelas e índices criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();

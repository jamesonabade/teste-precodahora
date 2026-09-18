import fs from 'fs';
import { pool } from '../src/db.js';

async function testCleanup() {
  const sql = fs.readFileSync('./database/cleanup_legacy_tables.sql', 'utf8');
  await pool.query(sql);
  console.log('✅ Cleanup script executado com sucesso localmente!');

  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log('\n📊 Tabelas ativas no PostgreSQL:');
  tables.rows.forEach(r => console.log('  -', r.table_name));

  const views = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'VIEW'
    ORDER BY table_name
  `);
  console.log('\n📊 Views ativas no PostgreSQL:');
  views.rows.forEach(r => console.log('  -', r.table_name));

  await pool.end();
}

testCleanup().catch(console.error);

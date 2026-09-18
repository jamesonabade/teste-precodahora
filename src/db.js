import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5433,
        user: process.env.DB_USER || 'precodahora',
        password: process.env.DB_PASSWORD || 'precodahora_pwd',
        database: process.env.DB_NAME || 'precodahora_db',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
);

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}

export async function testConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT version(), current_database(), current_user');
    return res.rows[0];
  } finally {
    client.release();
  }
}

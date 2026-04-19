// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — MySQL Connection Pool & Query Helper
// Used by every service and blockchain module.
// ─────────────────────────────────────────────────────────────────────────────

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vanrakshak',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

/**
 * Execute a parameterised SQL query against the pool.
 *
 * @param {string} sql  - SQL statement with `?` placeholders.
 * @param {Array}  params - Values to bind into the placeholders.
 * @returns {Promise<Array|Object>} For SELECT → array of rows.
 *   For INSERT/UPDATE/DELETE → ResultSetHeader with insertId, affectedRows, etc.
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export default pool;

// ✓ FILE COMPLETE: models/db.js

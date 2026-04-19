// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Migration Runner
// Reads all .sql files from /migrations in sorted order and executes each
// against the MySQL database.
//
// Usage:  node run_migrations.js
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vanrakshak',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  console.log('🌲 VanRakshak — Running migrations...\n');

  const migrationsDir = path.join(__dirname, 'migrations');

  // Read and sort migration files alphabetically.
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('⚠  No .sql files found in /migrations.');
    await connection.end();
    return;
  }

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      await connection.query(sql);
      console.log(`  ✓ Migration: ${file}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${file} — ${err.message}`);
      // Continue with remaining migrations rather than aborting.
    }
  }

  console.log('\n✓ All migrations processed.');
  await connection.end();
}

runMigrations().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});

// ✓ FILE COMPLETE: run_migrations.js

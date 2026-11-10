import 'server-only';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { attachDatabasePool } from '@vercel/functions';
import * as schema from './schema';

// Sesuai skill neon-postgres: di Vercel pakai node-postgres + Fluid compute + attachDatabasePool,
// dengan koneksi POOLED (DATABASE_URL, host berakhiran -pooler).
type DB = NodePgDatabase<typeof schema>;
const g = globalThis as unknown as { __dojoDb?: DB };

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL belum diset. Jalankan `neon env pull`.');
  // pg 8 memperlakukan sslmode=require sebagai verify-full; tulis eksplisit supaya tetap ketat di pg 9.
  return url.replace('sslmode=require', 'sslmode=verify-full');
}

export function getDb(): DB {
  if (!g.__dojoDb) {
    const pool = new Pool({ connectionString: connectionString(), max: 5, keepAlive: true, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 10_000 });
    attachDatabasePool(pool);
    g.__dojoDb = drizzle(pool, { schema });
  }
  return g.__dojoDb;
}

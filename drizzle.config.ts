import { defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

// Migrasi memakai koneksi DIRECT (tanpa -pooler), sesuai skill neon-postgres.
const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error('DATABASE_URL_UNPOOLED belum diset. Jalankan `neon env pull`.');

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: url.replace('sslmode=require', 'sslmode=verify-full') },
  strict: true,
  verbose: true,
});

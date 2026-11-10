import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Unit test untuk logika murni (tanpa DB/jaringan). E2E berjalan terpisah di branch Neon "e2e".
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});

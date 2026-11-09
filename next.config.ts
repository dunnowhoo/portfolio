import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Modul native: jangan dibundel
  serverExternalPackages: ['@node-rs/argon2'],
  turbopack: { root: path.resolve('.') },
  outputFileTracingRoot: path.resolve('.'),
  // Materi Dōjō dibaca dari disk saat runtime: pastikan ikut ke bundle fungsi
  outputFileTracingIncludes: { '/**': ['./content/dojo/**/*'] },
  async headers() {
    return [
      { source: '/api/dojo/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;

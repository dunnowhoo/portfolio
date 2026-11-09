import 'server-only';

export type AuthConfig = { slug: string; username: string; passwordHash: string; secret: string };

// Semua diambil dari env. Hash disimpan base64 supaya karakter `$` di hash argon2 tidak
// diekspansi oleh loader .env.
export function authConfig(): AuthConfig | null {
  const { DASHBOARD_SLUG, ADMIN_USERNAME, ADMIN_PASSWORD_HASH_B64, AUTH_SECRET } = process.env;
  if (!DASHBOARD_SLUG || !ADMIN_USERNAME || !ADMIN_PASSWORD_HASH_B64 || !AUTH_SECRET) return null;
  return {
    slug: DASHBOARD_SLUG,
    username: ADMIN_USERNAME,
    passwordHash: Buffer.from(ADMIN_PASSWORD_HASH_B64, 'base64').toString('utf8'),
    secret: AUTH_SECRET,
  };
}

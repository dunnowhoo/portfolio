import 'server-only';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { session } from '@/db/schema';
import { newToken, sha256Hex } from './crypto';

const PROD = process.env.NODE_ENV === 'production';
// __Host- memaksa Secure, Path=/, tanpa Domain. Di localhost (http) pakai nama biasa.
export const SESSION_COOKIE = PROD ? '__Host-dojo' : 'dojo_dev';
const MAX_AGE_S = 30 * 24 * 60 * 60;

export async function createSession(meta: { userAgent: string; ipHash: string }): Promise<void> {
  const token = newToken();
  await getDb()
    .insert(session)
    .values({
      tokenHash: sha256Hex(token),
      expiresAt: new Date(Date.now() + MAX_AGE_S * 1000),
      userAgent: meta.userAgent,
      ipHash: meta.ipHash,
    });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE_S,
  });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await getDb().select().from(session).where(eq(session.tokenHash, sha256Hex(token))).limit(1);
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(session).where(eq(session.tokenHash, sha256Hex(token)));
  store.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(): Promise<void> {
  await getDb().delete(session);
  (await cookies()).delete(SESSION_COOKIE);
}

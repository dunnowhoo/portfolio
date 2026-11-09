import 'server-only';
import { and, count, eq, gte } from 'drizzle-orm';
import { verify } from '@node-rs/argon2';
import { getDb } from '@/db/client';
import { loginAttempt } from '@/db/schema';
import { authConfig } from './config';
import { hmacHex, safeEqual } from './crypto';
import { requestMeta } from './request';
import { createSession } from './session';

export type LoginResult = { ok: true } | { ok: false; error: string };

const IP_LIMIT = 5; // gagal per IP dalam 15 menit
const GLOBAL_LIMIT = 20; // gagal total dalam 1 jam

async function isLocked(ipHash: string): Promise<boolean> {
  const db = getDb();
  const [{ n: ipFails }] = await db
    .select({ n: count() })
    .from(loginAttempt)
    .where(and(eq(loginAttempt.ipHash, ipHash), eq(loginAttempt.success, false), gte(loginAttempt.createdAt, new Date(Date.now() - 15 * 60_000))));
  const [{ n: allFails }] = await db
    .select({ n: count() })
    .from(loginAttempt)
    .where(and(eq(loginAttempt.success, false), gte(loginAttempt.createdAt, new Date(Date.now() - 60 * 60_000))));
  return ipFails >= IP_LIMIT || allFails >= GLOBAL_LIMIT;
}

export async function attemptLogin(username: string, password: string): Promise<LoginResult> {
  const cfg = authConfig();
  if (!cfg) return { ok: false, error: 'Sign-in is not configured yet.' };
  const meta = await requestMeta();
  const ipHash = hmacHex(cfg.secret, meta.ip);
  if (await isLocked(ipHash)) return { ok: false, error: 'Too many attempts. Try again in 15 minutes.' };

  const userOk = safeEqual(username.trim(), cfg.username);
  let passOk = false;
  try {
    passOk = await verify(cfg.passwordHash, password); // selalu dijalankan, supaya waktu respons sama
  } catch {
    passOk = false;
  }
  const ok = userOk && passOk;
  await getDb().insert(loginAttempt).values({ ipHash, success: ok });
  if (!ok) {
    await new Promise((r) => setTimeout(r, 350));
    return { ok: false, error: 'Wrong username or password.' }; // pesan sama untuk username/password
  }
  await createSession({ userAgent: meta.userAgent, ipHash });
  return { ok: true };
}

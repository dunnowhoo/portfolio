import { getDb } from '@/db/client';
import * as schema from '@/db/schema';
import { getSession } from '@/lib/auth/session';

// Ekspor JSON seluruh data Dōjō + CMS (tanpa sesi & percobaan login). Hanya untuk sesi aktif.
const TABLES = [
  'profile', 'activityEvent', 'dailyStat', 'streakState', 'busyDay', 'nodeProgress', 'problemProgress', 'card', 'quizSession', 'dailySet', 'quest', 'goal',
  'reflection', 'badgeAward', 'daruma', 'jlptSession', 'countdown', 'reminderLog', 'note', 'customResource', 'materialRead', 'siteSection', 'siteRevision', 'mediaAsset',
] as const;

export async function GET() {
  if (!(await getSession())) return new Response('Not found', { status: 404 });
  const db = getDb();
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString(), version: 1 };
  for (const t of TABLES) out[t] = await db.select().from(schema[t]);
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(out, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="dojo-backup-${stamp}.json"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

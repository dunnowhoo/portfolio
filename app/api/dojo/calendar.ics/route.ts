import { safeEqual } from '@/lib/auth/crypto';
import { getSession } from '@/lib/auth/session';
import { buildIcs, icsToken } from '@/lib/dojo/calendar';

// Kalender Dōjō (.ics) untuk Apple/Google Calendar. Akses: token langganan, atau sesi login.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const allowed = (token && safeEqual(token, icsToken())) || !!(await getSession());
  if (!allowed) return new Response('Not found', { status: 404 });
  const body = await buildIcs();
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="dojo.ics"',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { isGate } from '@/lib/auth/gate';
import { getSession } from '@/lib/auth/session';

// Lapis kedua: SETIAP page/action Dōjō memanggil ini sebelum mengambil data apa pun.
// Jangan mengandalkan layout saja, karena layout dan page dirender paralel.
export async function requireDojo(gate: string) {
  if (!isGate(gate)) notFound();
  const s = await getSession();
  if (!s) redirect(`/${gate}`);
  return s;
}

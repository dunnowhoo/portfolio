import { notFound, redirect } from 'next/navigation';
import { isGate } from '@/lib/auth/gate';
import { getSession } from '@/lib/auth/session';
import LoginCard from '@/components/dojo/LoginCard';

export default async function GatePage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  if (!isGate(gate)) notFound();
  if (await getSession()) redirect(`/${gate}/beranda`);
  return <LoginCard />;
}

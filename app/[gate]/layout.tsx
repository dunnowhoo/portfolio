import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isGate } from '@/lib/auth/gate';

type Props = { children: React.ReactNode; params: Promise<{ gate: string }> };

// Metadata hanya diberikan untuk slug yang benar, supaya 404 untuk path asing identik dengan 404 biasa.
export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { gate } = await params;
  if (!isGate(gate)) return {};
  return { title: 'Dōjō 道場', robots: { index: false, follow: false, nocache: true } };
}

export default async function GateLayout({ children, params }: Props) {
  const { gate } = await params;
  if (!isGate(gate)) notFound();
  return children;
}

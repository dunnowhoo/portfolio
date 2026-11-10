import PathPage from '@/components/dojo/path/PathPage';
import { requireDojo } from '@/lib/dojo/dal';

export default async function Page({ params, searchParams }: { params: Promise<{ gate: string }>; searchParams: Promise<{ node?: string }> }) {
  const { gate } = await params;
  const { node } = await searchParams;
  await requireDojo(gate);
  return <PathPage track="dsa" initialNode={typeof node === 'string' ? node.slice(0, 80) : undefined} />;
}
